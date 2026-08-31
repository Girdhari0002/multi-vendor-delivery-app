import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaTrash, FaLock, FaUnlock, FaEye } from 'react-icons/fa';
import Tabs from '../../components/ui/Tabs';
import SearchBar from '../../components/ui/SearchBar';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, user: null, loading: false });
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const tabs = [
    { key: 'all', label: 'All Users', count: users.length },
    { key: 'customer', label: 'Customers', count: users.filter(u => u.role === 'customer').length },
    { key: 'seller', label: 'Sellers', count: users.filter(u => u.role === 'seller').length },
    { key: 'delivery', label: 'Delivery Agents', count: users.filter(u => u.role === 'delivery').length },
    { key: 'admin', label: 'Admins', count: users.filter(u => u.role === 'admin').length },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = activeTab === 'all' || u.role === activeTab;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, activeTab]);

  const handleAction = async () => {
    const { type, user } = confirmDialog;
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      if (type === 'block') {
        await api.put(`/admin/block-user/${user._id}`);
        toast.success(`User ${user.isBlocked ? 'unblocked' : 'blocked'}`);
        fetchUsers();
      } else if (type === 'delete') {
        await api.delete(`/admin/users/${user._id}`);
        toast.success('User deleted');
        setUsers(prev => prev.filter(x => x._id !== user._id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setConfirmDialog({ isOpen: false, type: null, user: null, loading: false });
    }
  };

  const handleViewDetails = (user) => {
    if (user.role === 'customer') navigate(`/admin/customers/${user._id}`);
    else if (user.role === 'seller') navigate(`/admin/sellers/${user._id}`);
    else toast.info(`View details for ${user.role} is not available yet`);
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <Avatar src={user.profilePicture} name={user.name} size="sm" />
          <span className="font-medium text-slate-800">{user.name}</span>
        </div>
      )
    },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => {
        const variants = { admin: 'primary', seller: 'info', delivery: 'warning', customer: 'neutral' };
        return <Badge variant={variants[val] || 'neutral'} className="uppercase">{val}</Badge>;
      }
    },
    {
      key: 'isBlocked',
      label: 'Status',
      sortable: true,
      render: (isBlocked) => (
        <Badge variant={isBlocked ? 'danger' : 'success'} dot>
          {isBlocked ? 'Blocked' : 'Active'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(user)} icon={<FaEye />} title="View Details" />
          {user.role !== 'admin' && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setConfirmDialog({ isOpen: true, type: 'block', user, loading: false })} 
                icon={user.isBlocked ? <FaUnlock className="text-green-500"/> : <FaLock className="text-orange-500"/>} 
                title={user.isBlocked ? 'Unblock' : 'Block'} 
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', user, loading: false })} 
                icon={<FaTrash className="text-red-500"/>} 
                title="Delete" 
              />
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Enhanced User Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage customers, sellers, and agents</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1 mb-6 overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" className="p-3" />
      </div>

      <div className="mb-6 max-w-md">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search by name or email..." 
        />
      </div>

      <DataTable 
        columns={columns} 
        data={filteredUsers} 
        loading={loading} 
        pagination 
        pageSize={10} 
        emptyMessage="No users found matching your criteria."
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: null, user: null, loading: false })}
        onConfirm={handleAction}
        loading={confirmDialog.loading}
        title={confirmDialog.type === 'delete' ? 'Delete User' : confirmDialog.user?.isBlocked ? 'Unblock User' : 'Block User'}
        message={confirmDialog.type === 'delete' 
          ? `Are you sure you want to delete ${confirmDialog.user?.name}? This action cannot be undone.` 
          : `Are you sure you want to ${confirmDialog.user?.isBlocked ? 'unblock' : 'block'} ${confirmDialog.user?.name}?`}
        variant={confirmDialog.type === 'delete' ? 'danger' : 'warning'}
        confirmLabel={confirmDialog.type === 'delete' ? 'Delete' : 'Confirm'}
      />
    </div>
  );
};

export default Users;
