import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  Wrench, 
  Upload, 
  Clock, 
  AlertCircle, 
  FileText, 
  CheckCircle,
  ArrowRight,
  LogOut
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { currentUser, onboardUser, activeTab, setActiveTab, showToast } = useApp();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  
  // Onboarding Form Fields
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [departmentId, setDepartmentId] = useState<number>(1);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(currentUser.email || '');
  
  // Student specific
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);

  // Teacher / Staff specific
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');

  // Document Upload
  const [fileUrl, setFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Fetch departments
    const token = localStorage.getItem('cg_token');
    fetch('http://localhost:8000/api/departments/', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDepartments(data);
          if (data.length > 0) {
            setDepartmentId(data[0].id);
          }
        }
      })
      .catch(err => console.error('Failed to load departments', err));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (max 5MB, PDF or Images)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid File Type', 'Please upload a PDF or an Image (JPEG/PNG).', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Maximum file size allowed is 5MB.', 'warning');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('cg_token');
      const res = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setFileUrl(data.url);
        showToast('Upload Successful', 'Verification document uploaded.', 'success');
      } else {
        showToast('Upload Failed', 'Failed to upload document.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Upload Error', 'Error uploading file.', 'warning');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cg_token');
    window.location.reload();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole === 'student' && !studentId) {
      showToast('Missing Fields', 'Student ID is required.', 'warning');
      return;
    }

    if ((selectedRole === 'teacher' || selectedRole === 'staff') && !employeeId) {
      showToast('Missing Fields', 'Employee ID is required.', 'warning');
      return;
    }

    const payload: any = {
      role: selectedRole.toUpperCase(),
      department_id: departmentId,
      phone: phone || undefined,
      document_url: fileUrl || undefined
    };

    if (selectedRole === 'student') {
      payload.student_id = studentId;
      payload.course = course;
      payload.year = Number(year);
      payload.semester = Number(semester);
    } else {
      payload.employee_id = employeeId;
      payload.designation = designation;
    }

    await onboardUser(payload);
  };

  const handleBackToLogin = () => {
    handleLogout();
  };

  // Render Verification Pending View
  if (activeTab === 'verification-pending' || currentUser.status === 'PENDING' && (currentUser.studentId || currentUser.employeeId || currentUser.designation)) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 space-y-8 text-center">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Verification Pending</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your details have been submitted and are currently being reviewed by the administration.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Requested Role:</span>
              <span className="text-white font-semibold uppercase">{currentUser.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Under Review
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Verification Steps:</span>
            </div>
            <div className="space-y-2 pt-1 pl-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Submitted</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400 font-medium">
                <span className="w-3.5 h-3.5 border border-cyan-400/40 rounded-full flex items-center justify-center text-[8px]">●</span>
                <span>Under Review</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3.5 h-3.5 border border-slate-700 rounded-full"></span>
                <span>Verified</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBackToLogin}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 text-black hover:bg-cyan-300 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Verification Rejected View
  if (activeTab === 'verification-rejected' || currentUser.status === 'REJECTED') {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 space-y-8 text-center">
        <div className="glass-panel p-8 rounded-3xl border border-rose-950/40 shadow-[0_0_30px_rgba(239,68,68,0.1)] space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Verification Rejected</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unfortunately, your verification request has been rejected.
            </p>
          </div>

          {currentUser.verificationReason && (
            <div className="p-4 rounded-2xl bg-rose-950/10 border border-rose-500/20 text-left space-y-1.5 text-xs text-rose-300">
              <span className="font-semibold text-rose-400">Reason:</span>
              <p className="leading-relaxed">{currentUser.verificationReason}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                // Return to onboarding to re-submit details
                setStep('form');
                setActiveTab('onboarding');
              }}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 text-black hover:bg-cyan-300 transition-all flex items-center justify-center gap-2"
            >
              <span>Resubmit Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Role Selection
  if (step === 'role') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-white">Choose your Campus Role</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Please select your official university role to request verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Student Option */}
          <div
            onClick={() => setSelectedRole('student')}
            className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
              selectedRole === 'student'
                ? 'bg-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-4">
              <div className={`w-10 h-10 rounded-xl bg-slate-850 border border-slate-700 flex items-center justify-center text-cyan-400`}>
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Student</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Report dormitory, classroom, or public infrastructure issues.
                </p>
              </div>
            </div>
          </div>

          {/* Teacher Option */}
          <div
            onClick={() => setSelectedRole('teacher')}
            className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
              selectedRole === 'teacher'
                ? 'bg-slate-900 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-4">
              <div className={`w-10 h-10 rounded-xl bg-slate-850 border border-slate-700 flex items-center justify-center text-emerald-400`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Faculty / Teacher</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Report classroom AV, lab equipment, or faculty office defects.
                </p>
              </div>
            </div>
          </div>

          {/* Staff Option */}
          <div
            onClick={() => setSelectedRole('staff')}
            className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
              selectedRole === 'staff'
                ? 'bg-slate-900 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-4">
              <div className={`w-10 h-10 rounded-xl bg-slate-850 border border-slate-700 flex items-center justify-center text-amber-400`}>
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Maintenance Staff</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Technician portal to assign, claim, and mark repair tickets.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setStep('form')}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-cyan-400 text-black hover:bg-cyan-300 transition-all flex items-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Role Verification Form
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Verify Identity as {selectedRole.toUpperCase()}</h2>
          <p className="text-xs text-slate-400 mt-1">Please provide accurate verification details.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Campus Email</label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {selectedRole === 'student' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Student ID / Roll Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STU-2026-0041"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Course / Program</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Computer Science"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Year</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Employee / Faculty ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FAC-55012"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Associate Professor / Senior Technician"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Phone Number (Optional)</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">ID Document Upload (Optional)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer bg-slate-900/50 border-slate-700 hover:bg-slate-900/80 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <p className="text-xs text-cyan-400 font-medium animate-pulse">Uploading...</p>
                  ) : fileUrl ? (
                    <div className="flex flex-col items-center space-y-1.5">
                      <FileText className="w-8 h-8 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-medium">Document Uploaded</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-500 mb-2" />
                      <p className="text-xs text-slate-400">
                        <span className="font-semibold">Click to upload</span> student or employee ID
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1">PDF, PNG, JPG (MAX. 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setStep('role')}
              className="flex-1 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl font-bold text-xs bg-cyan-400 text-black border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-cyan-300 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Submit Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
