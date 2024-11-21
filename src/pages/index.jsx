import { useState, useEffect } from "react";
import 'tailwindcss/tailwind.css';

export default function Home() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
  
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
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
  
    //Files
    // const handleFileUpload = async (e) => {
    //   e.preventDefault();
    //   if (!selectedFile) return;
  
    //   const formData = new FormData();
    //   formData.append('file', selectedFile);
  
    //   try {
    //     const res = await fetch('/api/upload', {
    //       method: 'POST',
    //       body: formData,
    //     });
    //     const data = await res.json();
    //     alert('File uploaded successfully!');
    //   } catch (error) {
    //     console.error('Error uploading file:', error);
    //   }
    // };

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
          {preview && <img src={preview} alt="Preview"></img>}
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
  
        <table className="table-auto border-collapse border border-gray-300 w-full text-center">
          <thead>
            <tr>
              <th className="bg-pink-300 border border-gray-300 px-4 py-2">Name</th>
              <th className="bg-pink-300 border border-gray-300 px-4 py-2">Email</th>
              <th className="bg-pink-300 border border-gray-300 px-4 py-2">Doc</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">{user.doc}</td>
              </tr>
            ))}
          </tbody>
        </table>
  
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
  