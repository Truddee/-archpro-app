import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Calendar, Plus, Search, Download, BarChart3, Users, FolderOpen, ChevronRight, Menu, X, Trash2, Edit2, DollarSign, TrendingUp } from 'lucide-react';

const ArchProjectManagement = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [projects, isLoading]);

  const loadData = async () => {
    try {
      const saved = localStorage.getItem('arch-projects');
      if (saved) {
        setProjects(JSON.parse(saved));
      } else {
        setProjects([
          {
            id: 1,
            name: 'Downtown Innovation Hub',
            client: 'Tech Ventures Inc',
            location: '123 Main Street, San Francisco, CA',
            assignedTo: 'Sarah Martinez',
            startDate: '2024-01-15',
            totalCost: 2500000,
            actualSpent: 0,
            status: 'active',
            milestones: [
              { id: 1, name: 'Site Analysis', description: 'Initial evaluation', targetDate: '2024-03-01', budget: 150000, progress: 100 },
              { id: 2, name: 'Schematic Design', description: 'Detailed drawings', targetDate: '2024-05-15', budget: 300000, progress: 80 }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Load error:', error);
    }
    setIsLoading(false);
  };

  const saveData = async () => {
    try {
      localStorage.setItem('arch-projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const addProject = async (projectData) => {
    const newProject = {
      ...projectData,
      id: Date.now(),
      status: 'active'
    };
    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
    setCurrentPage('project-detail');
  };

  const updateProject = (projectId, updates) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
    if (selectedProject?.id === projectId) {
      setSelectedProject({ ...selectedProject, ...updates });
    }
  };

  const addMilestone = (projectId, milestone) => {
    const project = projects.find(p => p.id === projectId);
    const newMilestone = { ...milestone, id: Date.now() };
    const updatedMilestones = [...(project.milestones || []), newMilestone];
    updateProject(projectId, { milestones: updatedMilestones });
  };

  const updateMilestone = (projectId, milestoneId, updates) => {
    const project = projects.find(p => p.id === projectId);
    const updatedMilestones = project.milestones.map(m => 
      m.id === milestoneId ? { ...m, ...updates } : m
    );
    updateProject(projectId, { milestones: updatedMilestones });
  };

  const deleteMilestone = (projectId, milestoneId) => {
    const project = projects.find(p => p.id === projectId);
    updateProject(projectId, { milestones: project.milestones.filter(m => m.id !== milestoneId) });
  };

  const calculateProgress = (project) => {
    if (!project.milestones || project.milestones.length === 0) return 0;
    return Math.round(project.milestones.reduce((sum, m) => sum + m.progress, 0) / project.milestones.length);
  };

  const exportCSV = () => {
    let csv = 'Project,Client,Assigned To,Progress,Budget,Spent,Status\n';
    projects.forEach(p => {
      const progress = calculateProgress(p);
      csv += `"${p.name}","${p.client}","${p.assignedTo}","${progress}%","${p.totalCost}","${p.actualSpent || 0}","${p.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setShowMobileMenu={setShowMobileMenu} />
        <main className="flex-1 overflow-y-auto p-6">
          {currentPage === 'dashboard' && <Dashboard projects={projects} calculateProgress={calculateProgress} setSelectedProject={setSelectedProject} setCurrentPage={setCurrentPage} exportCSV={exportCSV} />}
          {currentPage === 'all-projects' && <AllProjects projects={projects} searchTerm={searchTerm} setSearchTerm={setSearchTerm} calculateProgress={calculateProgress} setSelectedProject={setSelectedProject} setCurrentPage={setCurrentPage} exportCSV={exportCSV} />}
          {currentPage === 'new-project' && <NewProject addProject={addProject} />}
          {currentPage === 'project-detail' && <ProjectDetail selectedProject={selectedProject} updateProject={updateProject} addMilestone={addMilestone} updateMilestone={updateMilestone} deleteMilestone={deleteMilestone} calculateProgress={calculateProgress} setCurrentPage={setCurrentPage} />}
        </main>
      </div>
      {showMobileMenu && <div onClick={() => setShowMobileMenu(false)} className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"></div>}
    </div>
  );
};

const Sidebar = ({ currentPage, setCurrentPage, showMobileMenu, setShowMobileMenu }) => (
  <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform ${showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
    <div className="flex items-center justify-between p-6 border-b border-slate-800">
      <div className="flex items-center space-x-2">
        <FolderOpen className="w-8 h-8 text-blue-400" />
        <span className="text-xl font-bold">ArchPro</span>
      </div>
      <button onClick={() => setShowMobileMenu(false)} className="lg:hidden">
        <X className="w-6 h-6" />
      </button>
    </div>
    <nav className="p-4 space-y-2">
      <button onClick={() => { setCurrentPage('dashboard'); setShowMobileMenu(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${currentPage === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
        <BarChart3 className="w-5 h-5" />
        <span>Dashboard</span>
      </button>
      <button onClick={() => { setCurrentPage('all-projects'); setShowMobileMenu(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${currentPage === 'all-projects' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
        <FolderOpen className="w-5 h-5" />
        <span>All Projects</span>
      </button>
      <button onClick={() => { setCurrentPage('new-project'); setShowMobileMenu(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${currentPage === 'new-project' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
        <Plus className="w-5 h-5" />
        <span>New Project</span>
      </button>
    </nav>
  </div>
);

const Header = ({ setShowMobileMenu }) => (
  <header className="bg-white border-b px-6 py-4">
    <button onClick={() => setShowMobileMenu(true)} className="lg:hidden">
      <Menu className="w-6 h-6" />
    </button>
  </header>
);

const Dashboard = ({ projects, calculateProgress, setSelectedProject, setCurrentPage, exportCSV }) => {
  const active = projects.filter(p => p.status === 'active');
  const total = projects.reduce((sum, p) => sum + p.totalCost, 0);
  const spent = projects.reduce((sum, p) => sum + (p.actualSpent || 0), 0);
  const avg = projects.length > 0 ? projects.reduce((sum, p) => sum + calculateProgress(p), 0) / projects.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button onClick={exportCSV} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between mb-2">
            <span className="text-slate-600">Active</span>
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{active.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between mb-2">
            <span className="text-slate-600">Budget</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">${(total / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between mb-2">
            <span className="text-slate-600">Spent</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">${(spent / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between mb-2">
            <span className="text-slate-600">Progress</span>
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">{avg.toFixed(0)}%</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Recent Projects</h2>
        </div>
        <div className="divide-y">
          {projects.slice(0, 8).map(p => {
            const progress = calculateProgress(p);
            return (
              <div key={p.id} onClick={() => { setSelectedProject(p); setCurrentPage('project-detail'); }} className="p-4 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                        <p className="text-xs text-slate-600 truncate">{p.client}</p>
                      </div>
                      <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600">
                        <Users className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{p.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="text-xs font-medium w-10 text-right">{progress}%</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Budget: ${(p.totalCost / 1000).toFixed(0)}K</span>
                  <span>Spent: ${((p.actualSpent || 0) / 1000).toFixed(0)}K</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AllProjects = ({ projects, searchTerm, setSearchTerm, calculateProgress, setSelectedProject, setCurrentPage, exportCSV }) => {
  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Projects</h1>
        <button onClick={exportCSV} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p => {
          const progress = calculateProgress(p);
          return (
            <div key={p.id} onClick={() => { setSelectedProject(p); setCurrentPage('project-detail'); }} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold truncate">{p.name}</h3>
                  <p className="text-slate-600 text-sm truncate">{p.client}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{p.assignedTo}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">Progress</span>
                    <span className="text-xs font-semibold">{progress}%</span>
                  </div>
                  <div className="bg-slate-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t text-xs">
                  <span>Budget: ${(p.totalCost / 1000).toFixed(0)}K</span>
                  <span>Spent: ${((p.actualSpent || 0) / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NewProject = ({ addProject }) => {
  const [form, setForm] = useState({ name: '', client: '', location: '', assignedTo: '', startDate: '', totalCost: '' });
  const [milestones, setMilestones] = useState([]);
  const [current, setCurrent] = useState({ name: '', description: '', targetDate: '', budget: '', progress: 0 });
  const [error, setError] = useState('');

  const addMilestoneToList = () => {
    if (current.name && current.targetDate && current.budget) {
      setMilestones([...milestones, { ...current, budget: parseFloat(current.budget), progress: parseInt(current.progress) }]);
      setCurrent({ name: '', description: '', targetDate: '', budget: '', progress: 0 });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const missing = [];
    if (!form.name) missing.push('Project Name');
    if (!form.client) missing.push('Client Name');
    if (!form.assignedTo) missing.push('Assigned To');
    if (!form.startDate) missing.push('Start Date');
    if (!form.totalCost) missing.push('Total Cost');

    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    await addProject({
      name: form.name,
      client: form.client,
      location: form.location || '',
      assignedTo: form.assignedTo,
      startDate: form.startDate,
      totalCost: parseFloat(form.totalCost),
      milestones,
      status: 'active',
      actualSpent: 0
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create New Project</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}
      <form onSubmit={submit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
          <h2 className="text-xl font-bold">Project Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Project Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Client Name *</label>
              <input type="text" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Full address" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Assigned To *</label>
              <input type="text" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} placeholder="Team member name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Total Cost (USD) *</label>
            <input type="number" value={form.totalCost} onChange={(e) =>
