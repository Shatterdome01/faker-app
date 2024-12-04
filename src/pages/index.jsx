/* eslint-disable @next/next/no-img-element */
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { useState, useEffect } from "react";
import 'tailwindcss/tailwind.css';

export default function Home() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    // Add Files
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    // PDF
    const [loading, setLoading] =useState(false);
    //Search
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState([]);
  
    //Users
    const generateUser = async () => {
      const res = await fetch('/api/users', { method: 'POST' });
      const data = await res.json();
      setUser(data.user);
    };
  
    const saveUser = async () => {
      if (!user) return;
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      fetchUsers();
    };
  
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/users?page=${page}&limit=${limit}`); 
        const data = await res.json();//endpoint
        console.log(data)
        setUsers(data.users);
        setFilter(data.users);  
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const handleSearch = (e) => {
      const value = e.target.value;
      setSearch(value);
    
      if (value === '') {
        setFilter(users);  
      } else {
        const filteredUsers = users.filter(user => {
          const nameMatch = user.name && user.name.toLowerCase().includes(value.toLowerCase());
          const emailMatch = user.email && user.email.toLowerCase().includes(value.toLowerCase());
          return nameMatch || emailMatch;
        });
        setFilter(filteredUsers);  
      }
    };

    // const handleSearch = async (e) => {
    //   setSearch(e.target.value);

    // const filteredUsers = users.filter( user => 
    //   user.name.toLowerCase().includes(search.toLowerCase()) ||
    //   user.email.toLowerCase().includes(search.toLowerCase())
    // )
    // console.log(filteredUsers);
    // setFilter(filteredUsers);
    //  }

    //Files
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
      
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        if (file) {
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
        }
      };
      
      const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
      
        const formData = new FormData();
        formData.append('file', selectedFile);
      
        const res = await fetch('/api/users', {
          method: 'POST',
          body: formData,
        });
      
        if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          alert('File uploaded successfully');
        } else {
          alert('File upload failed');
        }
      };

      //PDF
      const handlerDownload = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/users?page=1&limit=1000');
          const data = await response.json();

          if (!data.users || !Array.isArray(data.users)) {
            throw new Error('Los datos no son un array');
          }

          const users = data.users;

          const doc = new jsPDF();

          const title = 'Users List';
          const pageWidth = doc.internal.pageSize.getWidth(); //Ancho de la página
          const textWidth = doc.getTextWidth(title); //texto
          const x = (pageWidth - textWidth) / 2;
          doc.setFontSize(18);
          doc.text(title, x , 20);
          doc.setFont('helvetica', 'bold')

          doc.setFontSize(12);
          const tableData = users.map((user, index) => [
            index + 1,
            user.name,
            user.email, 
            user.doc, 
          ]);
    
          autoTable(doc, {
            head: [['#', 'Name', 'Email', 'Document']], 
            body: tableData,
            startY: 30, 
            theme: 'grid', 
            styles: {
              font: 'helvetica',
              fontSize: 10,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: [244, 114, 182], 
              textColor: [255, 255, 255], 
              fontSize: 12,
              fontStyle: 'bold',
            },
            bodyStyles: {
              textColor: [0, 0, 0], // Color del texto en el cuerpo
            },
            alternateRowStyles: {
              fillColor: [240, 240, 240], // Color alternado de las filas
            },
          });

           doc.save('reporte.pdf');
        }
        catch(error){
          console.log('Error to generate PDF: ', error );
        } 
        finally {
          setLoading(false);
        }
      }

  
    useEffect(() => {
      fetchUsers();
    }, [page, limit]);
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-black text-4xl font-bold text-center">User List</h1>

        <form onSubmit={handleFileUpload} className="text-center mt-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-2"
          />
          {preview && <img 
                            src={preview}  
                            className="w-64 h-64 object-contain mx-auto"
                            width={256}
                            height={256} alt="Preview"></img>}
          <button
            type="submit"
            className="btn btn-secondary py-2 px-4 bg-blue-400 hover:bg-blue-700 rounded-md text-white font-bold"
          >
            Upload File
          </button>
        </form>
  
        <div className="flex justify-center items-center h-20">
          <button
            className="btn btn-primary py-2 px-4 bg-pink-400 hover:bg-pink-700 rounded-md text-white font-bold"
            onClick={generateUser}
          >
            Generate User
          </button>
        </div>

        {/**SEARCH INPUT  */}
        <div className="flex justify-center items-center h-20">
          <input type="text" value={search} onChange={handleSearch} placeholder="Search..." className="border border-gray-300 p-2 rounded-md" />
        </div>
  
        {user && (
          <div>
            <p className="border border-gray-500 p-4 text-center rounded">
              {user.name} - {user.email}
            </p>
            <div className="mt-4 flex justify-center items-center h-20">
              <button
                className="btn btn-secondary py-2 px-4 bg-pink-400 hover:bg-pink-700 rounded-md text-white font-bold"
                onClick={saveUser}
              >
                Save User
              </button>
            </div>
          </div>
        )}
  
        <div className="text-center">
          <label>Records per page:</label>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
  {/* {pdf} */}

        <table className="table-auto border-collapse border border-gray-300 w-full text-center">
          <thead>
            <tr>
              <th className="bg-pink-300 border border-gray-300 px-4 py-2">Name</th>
              <th className="bg-pink-300 border border-gray-300 px-4 py-2">Email</th>
              <th className="bg-pink-300 border border-gray-300 px-4 py-2">Doc</th>
            </tr>
          </thead>
          <tbody>
            {filter.length > 0 ? (
              filter.map((user) => (
                <tr key={user.id}>
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">{user.doc}</td>
              </tr>
              )
            )) : (
              <tr>
                <td colSpan="3" className="border border-gray-300 px-4 py-2">No se encontraron coincidencias</td>
              </tr>
            )
           }
          </tbody>
        </table>

        <div className="flex justify-center items-center h-20 ">
          <button className="btn btn-secondary bg-green-500 text-white hover:bg-green-800 rounded py-2 px-2 flex items-center space-x-2" onClick={handlerDownload} disabled={loading}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6" 
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {loading ? 'Generating..,' : 'Download PDF'}
          </button>
        </div>
  
        <div className="flex gap-2 mt-4 flex justify-center items-center h-20">
          <button
            className="hover:bg-blue-400 rounded py-2 px-2"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <p className="font-bold">
            Showing page {page} of {Math.ceil(total / limit)}
          </p>
          <button
            className="hover:bg-blue-400 rounded py-2 px-2"
            disabled={page * limit >= total}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
  