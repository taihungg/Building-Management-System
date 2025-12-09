import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Wrench, Droplet, Zap, Wind, Shield, Trash2, Clock, Edit, Eye, CheckCircle } from 'lucide-react';
import { SlideOut } from './SlideOut';
import { Dropdown } from './Dropdown';
import { toast } from 'sonner';
import React from 'react';


const categoryIcons = {
  Plumbing: Droplet,
  Electrical: Zap,
  HVAC: Wind,
  Maintenance: Wrench,
  Cleaning: Trash2,
  Security: Shield,
};

export function ServiceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false);;

  //StateChoGetAllIssue
  const [allIssue, setAllIssue] = useState ([])
  const [error, setError] = useState(null);
  const [reporterName, setReporterName] = useState ('');
  const [apartmentLabel, setApartmentLabel] = useState('');
  
  // State cho createIssue
  const [updateApartmentID, setUpdateAppartmentID] = useState('');
  const [updateTitle, setUpdateTitle] = useState ('');
  const [updateDescription, setUpdateDescription] = useState ('');
  const [updateType , setUpdateType] = useState ('');
  const [updateReporterID, setUpdateReporterID] = useState ('');

  // 3. Gọi API
  const createIssueApi = async (issueData) => {
    try {
      const response = await fetch('http://localhost:8081/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify(issueData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Dùng errorData.message nếu server trả về cấu trúc lỗi chuẩn
        throw new Error(errorData.message || `Lỗi: ${response.status} khi tạo yêu cầu.`);
      }

      return await response.json();
    }
    catch (err) {
      throw err; 
    }
};
const handleSubmit = async(e)=>{
  e.preventDefault(); // Ngăn chặn hành vi mặc định của form

    // 1. Validate cơ bản
    if (!updateTitle || !updateDescription || !updateApartmentID) {
        toast.warning("Thiếu thông tin", { description: "Vui lòng điền đủ Tiêu đề, Mô tả và chọn Căn hộ." });
        return;
    }

    // 2. Định nghĩa logic Promise cho toast
    const promise = new Promise(async (resolve, reject) => {
        try {
            // Lấy reporterId dựa trên logic Admin/Resident
            const reporterId = localStorage.getItem('userId');

            const dataform = {
                apartmentId: updateApartmentID,
                title: updateTitle,
                description: updateDescription,
                type: updateType,
                reporterId: updateReporterID
            };
            
            await createIssueApi(dataform); 

            resolve("Đã tạo yêu cầu/sự cố thành công!");

        } catch (err) {
            reject(err);
        }
    });

    // 5. Hiển thị toast bằng promise
    toast.promise(promise, {
        loading: 'Đang gửi yêu cầu...',
        success: (message) => message, // Dùng message từ resolve
        error: (err) => `Thất bại: ${err.message}`, // Dùng message từ reject
    });
  }

  // Mục fetchAllIssue


 // Hàm fetchIssues đã được sửa trong ServiceManagement.js

const fetchIssues = async () => {
  setIsLoading(true);
  setError(null);
  try {
      let url = 'http://localhost:8081/api/issues';
      const response = await fetch(url);
      
      if (!response.ok) {
          throw new Error("Can't get issues list");
      }
      
      const rawData = await response.json();
      
      // --- BƯỚC QUAN TRỌNG: GỬI CÁC YÊU CẦU CHI TIẾT ĐỒNG THỜI ---
      const issuesWithDetailsPromise = rawData.map(async (issue) => {
          // Logic mapping Status và Category giữ nguyên
          const mapStatus = (status) => { /* ... */ 
              switch (status) {
                  case 'UNPROCESSED': return 'Unprocessed';
                  case 'PROCESSING': return 'In Progress';
                  case 'RESOLVED': return 'Completed'; 
                  default: return 'Unprocessed';
              }
          };

          const mapCategory = (type) => { /* ... */ 
              switch (type) {
                  case 'MAINTENANCE': return 'Maintenance'; 
                  case 'SECURITY': return 'Security'; 
                  case 'PLUMBING': return 'Plumbing'; 
                  case 'ELECTRICAL': return 'Electrical';
                  default: return 'Maintenance';
              }
          };
          
          // Trả về Issue đã được bổ sung thông tin
          return {
              ...issue, 
              title: issue.title,
              category: mapCategory(issue.type),
              status: mapStatus(issue.status), 
              unit: issue.roomNumber, 
              resident: issue.reporterName, 
              
          };
      });

      // Đợi tất cả các Promises (lời hứa) fetch chi tiết hoàn thành
      const transformedData = await Promise.all(issuesWithDetailsPromise);
      
      setAllIssue(transformedData);
      
  } catch (err) {
      setError(err.message);
  } finally {
      setIsLoading(false);
  }
}
    useEffect (()=>{
       fetchIssues();
    },[])




  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900">Service Management</h1>
          <p className="text-slate-500 mt-1">Track and manage all service requests</p>
        </div>
        <button 
          onClick={() => setIsNewRequestOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by unit, resident, or service type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-slate-500 text-sm">Unprocessed</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.filter(s => s.status === 'Unprocessed').length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-slate-500 text-sm">In Progress</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.filter(s => s.status === 'In Progress').length}</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {['In Progress', 'Unprocessed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-6 py-3 rounded-xl transition-all ${
              statusFilter === status
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Service Requests Grid */}
      <div className="grid grid-cols-2 gap-6">
      {allIssue.map((service) => {
    const Icon = categoryIcons[service.category] || Wrench; 
    
    return (
        <div key={service.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">            
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">{service.category}</p> 
                        <p className="text-slate-900">{service.title}</p> 
                    </div>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Unit:</span>
                    {/* Dùng service.unit (giả lập) */}
                    <span className="text-slate-900">#{service.unit}</span> 
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Resident:</span>
                    {/* Dùng service.resident (giả lập) */}
                    <span className="text-slate-900">{service.resident}</span> 
                </div>
              
              
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {/* Dùng service.status (đã map) */}
                <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                    service.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                    service.status === 'Processing' ? 'bg-blue-50 text-blue-700' :
                    service.status === 'Unprocessed' ? 'bg-purple-50 text-red-700' :
                    'bg-orange-50 text-orange-700' // Open/New
                }`}>
                    {service.status}
                </span>
            </div>
        </div>
    );
})}
      </div>

      {/* New Request Slide Out */}
      <SlideOut
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        title="New Service Request"
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-700 mb-2">Select Unit</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Unit 304 - Emma Johnson</option>
                <option>Unit 112 - Michael Chen</option>
                <option>Unit 205 - Sarah Williams</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Category</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>HVAC</option>
                <option>Maintenance</option>
                <option>Cleaning</option>
                <option>Security</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Priority</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Title</label>
              <input
                type="text"
                placeholder="Brief description of the issue"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Description</label>
              <textarea
                rows={4}
                placeholder="Provide detailed information about the service request..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Assign To (Optional)</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Unassigned</option>
                <option>John Smith (Plumbing)</option>
                <option>Mike Johnson (Maintenance)</option>
                <option>Cleaning Team</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsNewRequestOpen(false)}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all">
              Create Request
            </button>
          </div>
        </div>
      </SlideOut>
    </div>
  );
}
