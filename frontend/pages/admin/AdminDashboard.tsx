
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllUsers, addUser, updateUser, deleteUser, getAuditLogs } from '../../services/mockApi';
import type { User, Role, AuditLog } from '../../types';
import { ShieldIcon, UserIcon, PlusCircleIcon, XIcon, EditIcon, TrashIcon, BarChartIcon, BookOpenIcon, CheckSquareIcon, RefreshCwIcon } from '../../components/shared/icons';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';


const UserRoleChart: React.FC<{ users: User[] }> = ({ users }) => {
    const roleCounts = useMemo(() => {
        const counts = { student: 0, teacher: 0, admin: 0 };
        users.forEach(user => {
            if (counts[user.role] !== undefined) {
                counts[user.role]++;
            }
        });
        return [
            { name: 'Students', value: counts.student, color: '#22C55E' }, // Green-500
            { name: 'Teachers', value: counts.teacher, color: '#A855F7' }, // Purple-500
            { name: 'Admins', value: counts.admin, color: '#F43F5E' } // Rose-500
        ];
    }, [users]);
    
    return (
         <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <BarChartIcon className="w-6 h-6 text-slate-400" />
                User Analytics
            </h3>
            <div style={{width: '100%', height: 250}} className="animate-fade-in">
                <ResponsiveContainer>
                    <BarChart data={roleCounts} margin={{ top: 5, right: 20, left: -20, bottom: 0 }} barSize={40}>
                        <XAxis dataKey="name" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} className="text-slate-500 dark:text-slate-400 font-medium" />
                        <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} className="text-slate-500 dark:text-slate-400 font-medium" allowDecimals={false} />
                        <Tooltip
                            cursor={{fill: 'transparent'}}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                borderRadius: '0.75rem',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                color: '#1e293b'
                            }}
                            itemStyle={{ color: '#1e293b' }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                            {roleCounts.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-scale-in border dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors">Delete</button>
                </div>
            </div>
        </div>
    );
};


const UserModal: React.FC<{
    user: User | null;
    onClose: () => void;
    onSave: (user: User | Omit<User, 'id'|'auth_uid'>) => void;
}> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: 'student' as Role,
        student_id: '',
        password: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                student_id: user.student_id || '',
                password: user.password || '',
            });
        } else {
             setFormData({
                full_name: '',
                email: '',
                role: 'student',
                student_id: '',
                password: 'password123', // Default for new users
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSave: any = {
            full_name: formData.full_name,
            email: formData.email,
            role: formData.role,
            password: formData.password,
        };

        // Only add student_id if the role is student
        if (formData.role === 'student') {
            dataToSave.student_id = formData.student_id;
        } else {
            dataToSave.student_id = undefined; // Explicitly clear if switching away from student
        }
        
        // Pass all data up
        onSave(user ? { ...user, ...dataToSave } : dataToSave);
        onClose();
    };
    
    const inputClasses = "block w-full rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-slate-50 dark:bg-slate-800";
    const labelClasses = "block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1";

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-scale-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><XIcon className="w-6 h-6"/></button>
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">{user ? 'Edit User' : 'Add User'}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="full_name" className={labelClasses}>Full Name</label>
                        <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required className={inputClasses} placeholder="e.g. Alex Johnson"/>
                    </div>
                     <div>
                        <label htmlFor="email" className={labelClasses}>Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={inputClasses} placeholder="user@example.com"/>
                    </div>
                    <div>
                        <label htmlFor="password" className={labelClasses}>Password</label>
                        <input type="text" id="password" name="password" value={formData.password} onChange={handleChange} required className={inputClasses} placeholder="Password"/>
                    </div>
                    <div>
                        <label htmlFor="role" className={labelClasses}>Role</label>
                         <div className="relative">
                            <select 
                                id="role" 
                                name="role" 
                                value={formData.role} 
                                onChange={handleChange} 
                                required 
                                className={`${inputClasses} appearance-none`}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                         </div>
                    </div>
                    {formData.role === 'student' && (
                         <div className="animate-fade-in">
                            <label htmlFor="student_id" className={labelClasses}>Student ID</label>
                            <input type="text" id="student_id" name="student_id" value={formData.student_id} onChange={handleChange} className={inputClasses} placeholder="e.g. S001"/>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30 font-semibold transition-all transform hover:scale-105 active:scale-95">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  
  // Log Filters
  const [logFilterRole, setLogFilterRole] = useState<string>('all');
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchData = () => {
      setLoading(true);
      Promise.all([getAllUsers(), getAuditLogs()]).then(([userData, logData]) => {
          setUsers(userData);
          setLogs(logData);
          setLoading(false);
      });
  }
  
  useEffect(() => {
    fetchData();
    // No real-time subscription
  }, []);
  
  const handleOpenModal = (user: User | null) => {
      setEditingUser(user);
      setIsModalOpen(true);
  }
  
  const handleCloseModal = () => {
      setEditingUser(null);
      setIsModalOpen(false);
  }

  const getActor = () => user ? { name: user.full_name, role: user.role } : undefined;
  
  const handleSaveUser = async (userData: User | Omit<User, 'id'|'auth_uid'>) => {
      const isUpdate = 'id' in userData;
      
      const promise = isUpdate 
        ? updateUser(userData as User, getActor()) 
        : addUser(userData as Omit<User, 'id'|'auth_uid'>, getActor()).then(res => {
            if (!res.success) throw new Error(res.message);
            return res.user!;
        });
      
      toast.promise(promise, {
          loading: 'Saving user...',
          success: 'User saved successfully!',
          error: (e) => e.message || 'Failed to save user.'
      });
      // Refresh data after save
      setTimeout(fetchData, 500);
  }
  
  const initiateDeleteUser = (user: User) => {
      setUserToDelete(user);
      setIsDeleteModalOpen(true);
  }

  const confirmDeleteUser = async () => {
      if(userToDelete) {
          setIsDeleteModalOpen(false);
          const promise = deleteUser(userToDelete.id, getActor());
           toast.promise(promise, {
              loading: 'Deleting user...',
              success: 'User deleted successfully!',
              error: 'Failed to delete user.'
          });
          setUserToDelete(null);
          // Refresh data after delete
          setTimeout(fetchData, 500);
      }
  }

  const filteredUsers = useMemo(() => {
      if (filterRole === 'all') return users;
      return users.filter(u => u.role === filterRole);
  }, [users, filterRole]);

  const filteredLogs = useMemo(() => {
      return logs.filter(log => {
          const matchesRole = logFilterRole === 'all' || log.actorRole === logFilterRole;
          let matchesDate = true;
          if (logStartDate && logEndDate) {
               matchesDate = isWithinInterval(parseISO(log.timestamp), {
                   start: startOfDay(parseISO(logStartDate)),
                   end: endOfDay(parseISO(logEndDate))
               });
          } else if (logStartDate) {
              matchesDate = parseISO(log.timestamp) >= startOfDay(parseISO(logStartDate));
          } else if (logEndDate) {
               matchesDate = parseISO(log.timestamp) <= endOfDay(parseISO(logEndDate));
          }
          return matchesRole && matchesDate;
      });
  }, [logs, logFilterRole, logStartDate, logEndDate]);

  const handleExportLogs = () => {
      const csvContent = [
          ['Time', 'Actor Name', 'Actor Role', 'Action', 'Target'],
          ...filteredLogs.map(log => [
              format(parseISO(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
              `"${log.actorName}"`,
              log.actorRole,
              `"${log.action}"`,
              `"${log.target}"`
          ])
      ].map(e => e.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const renderSkeletons = () => (
    [...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="ml-4 space-y-2">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                 <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                 <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </td>
        </tr>
    ))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center gap-4">
            <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight">Admin Dashboard</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[220px] sm:max-w-none leading-snug">Welcome, {user?.full_name?.split(' ')[0]}. Manage users and system settings.</p>
            </div>
             <button 
                onClick={fetchData} 
                className="flex-shrink-0 flex flex-col items-center justify-center gap-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors active:translate-y-0.5 min-w-[70px]"
            >
                <RefreshCwIcon className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-center leading-none">Refresh<br/>Data</span>
            </button>
        </div>
      </div>

      <UserRoleChart users={users} />

      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('users')}
            className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'users' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
              Users
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
             className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'logs' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
              Audit Logs
          </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">User Management</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <select 
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2.5 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                        >
                            <option value="all">All Roles</option>
                            <option value="student">Students</option>
                            <option value="teacher">Teachers</option>
                            <option value="admin">Admins</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                    <button onClick={() => handleOpenModal(null)} className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 whitespace-nowrap">
                        <PlusCircleIcon className="w-5 h-5"/>
                        Add User
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? renderSkeletons() : filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                            {u.role === 'admin' ? <ShieldIcon className="h-5 w-5"/> : <UserIcon className="h-5 w-5"/>}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{u.full_name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{u.role === 'student' && u.student_id ? u.student_id : u.role === 'admin' ? 'Administrator' : 'Faculty Member'}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full capitalize ${
                            u.role === 'admin' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                            u.role === 'teacher' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                            'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}>
                        {u.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button onClick={() => handleOpenModal(u)} className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <EditIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => initiateDeleteUser(u)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      )}

      {activeTab === 'logs' && (
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <BookOpenIcon className="w-5 h-5" />
                    Audit Logs
                </h3>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-end w-full md:w-auto">
                    <div className="w-full sm:w-32">
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-bold uppercase">Role</label>
                         <select 
                            value={logFilterRole}
                            onChange={(e) => setLogFilterRole(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-36">
                         <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-bold uppercase">Start Date</label>
                         <input type="date" value={logStartDate} onChange={(e) => setLogStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="w-full sm:w-36">
                         <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-bold uppercase">End Date</label>
                         <input type="date" value={logEndDate} onChange={(e) => setLogEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                     <button onClick={handleExportLogs} className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm text-sm h-[38px]">
                        <CheckSquareIcon className="w-4 h-4"/>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actor</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    {format(parseISO(log.timestamp), 'MMM dd, HH:mm')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {log.actorName}
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                                     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full capitalize ${
                                        log.actorRole === 'admin' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                        log.actorRole === 'teacher' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}>
                                        {log.actorRole}
                                     </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-300 font-medium">
                                    {log.action}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {log.target}
                                </td>
                            </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                             <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                    No logs found matching current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
      )}

      {isModalOpen && <UserModal user={editingUser} onClose={handleCloseModal} onSave={handleSaveUser} />}
      
      <ConfirmationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteUser}
          title="Delete User"
          message={`Are you sure you want to delete ${userToDelete?.full_name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdminDashboard;
