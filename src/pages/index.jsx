import { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';

export default function Home() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const generateUser = async () => {
    const res = await fetch('/api/users', { method: 'POST' });
    const data = await res.json();
    setUser(data);
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

  useEffect(() => {
    fetchUsers();
  }, [page, limit]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-black text-4xl font-bold text-center">User List</h1>

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
                        <button className="btn btn-secondary py-2 px-4 bg-pink-400 hover:bg-pink-700 rounded-md text-white font-bold" onClick={saveUser}>
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
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                            <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul> */}

            <div className="flex gap-2 mt-4 flex justify-center items-center h-20">
                <button
                    className='hover:bg-blue-400 rounded  py-2 px-2'
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                    Previous
                </button>
                <p className='font-bold '>
                    Showing page {page} of {Math.ceil(total / limit)}
                </p>
                <button
                    className='hover:bg-blue-400 rounded  py-2 px-2'
                    disabled={page * limit >= total}
                    onClick={() => setPage((prev) => prev + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
