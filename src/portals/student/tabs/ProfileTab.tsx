import { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Hash,
  Lock,
  Camera,
  Upload,
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

export function ProfileTab() {
  const { currentStudentId, students, updateStudentPin, updateStudentAvatar, updateStudentProfile, addNotification } = useAppStore();
  const student = students.find((s) => s.id === currentStudentId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  // Self-service editable fields state
  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(student?.dateOfBirth || '');
  const [stateOfOrigin, setStateOfOrigin] = useState(student?.stateOfOrigin || '');
  const [lga, setLga] = useState(student?.lga || '');
  const [nationality, setNationality] = useState(student?.nationality || 'Nigerian');
  const [gender, setGender] = useState<'Male' | 'Female'>(student?.gender || 'Female');

  useEffect(() => {
    if (student) {
      setEmail(student.email || '');
      setPhone(student.phone || '');
      setDateOfBirth(student.dateOfBirth || '');
      setStateOfOrigin(student.stateOfOrigin || '');
      setLga(student.lga || '');
      setNationality(student.nationality || 'Nigerian');
      setGender(student.gender || 'Female');
    }
  }, [student]);

  if (!student) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addNotification('error', 'Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addNotification('warning', 'Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateStudentAvatar(student.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile(student.id, {
      email: email.trim(),
      phone: phone.trim(),
      dateOfBirth: dateOfBirth.trim(),
      stateOfOrigin: stateOfOrigin.trim(),
      lga: lga.trim(),
      nationality: nationality.trim(),
      gender,
    });
  };

  const handlePinUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPin || !newPin || !confirmPin) {
      addNotification('warning', 'Please fill in all PIN fields.');
      return;
    }
    if (newPin.length < 4) {
      addNotification('warning', 'New PIN must be at least 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      addNotification('error', 'New PIN and Confirm PIN do not match.');
      return;
    }
    if (newPin === currentPin) {
      addNotification('warning', 'New PIN cannot be the same as the current PIN.');
      return;
    }
    const success = updateStudentPin(student.id, currentPin, newPin);
    if (success) {
      setPinSuccess(true);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      addNotification('success', 'Security PIN updated successfully.');
      setTimeout(() => setPinSuccess(false), 3000);
    } else {
      addNotification('error', 'Current PIN is incorrect. Please try again.');
    }
  };

  return (
    <div className="page-container px-4 pt-5 space-y-5">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Avatar / Banner */}
      <div className="glass-card overflow-hidden">
        <div className="h-20 bg-hero-gradient relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all active:scale-95"
            title="Upload new profile picture"
          >
            <Camera size={13} />
            <span>Upload Photo</span>
          </button>
        </div>
        <div className="px-5 pb-5 -mt-10 flex flex-col">
          <div className="relative group w-20 h-20 mb-3">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.fullName}
                className="w-20 h-20 rounded-full object-cover shadow-xl border-4 border-uch-card"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-accent-gradient flex items-center justify-center text-white text-2xl font-bold shadow-xl border-4 border-uch-card badge-fill">
                {student.avatarInitials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all duration-200 backdrop-blur-xs cursor-pointer"
              title="Click to upload profile picture"
            >
              <Upload size={16} />
              <span className="text-[10px] font-medium">Change</span>
            </button>
          </div>

          <h2 className="font-bold text-lg" style={{ color: 'var(--uch-fg)' }}>{student.fullName}</h2>
          <p className="text-uch-muted text-sm">{student.department}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-xs font-semibold">
              {student.level}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-uch-surface border border-uch-border text-uch-muted text-xs font-medium">
              Matric: {student.matricNo}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              Entry Session: {student.entrySession}
            </span>
          </div>
        </div>
      </div>

      {/* Self-Service Profile Form */}
      <div className="glass-card p-5">
        <p className="text-xs font-bold text-uch-muted uppercase tracking-wider mb-4 flex items-center gap-2">
          <User size={14} /> Personal Bio &amp; Contact Information (Self-Service)
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Read-Only Admin Issued Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-uch-surface/60 border border-uch-border/40">
            <div>
              <span className="text-[10px] text-uch-muted font-semibold block uppercase">Full Name (Locked by Admin)</span>
              <p className="text-xs font-bold text-uch-fg mt-0.5">{student.fullName}</p>
            </div>
            <div>
              <span className="text-[10px] text-uch-muted font-semibold block uppercase">Matriculation Number (Locked)</span>
              <p className="text-xs font-mono font-bold text-teal-400 mt-0.5">{student.matricNo}</p>
            </div>
          </div>

          {/* Student Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="student-email" className="uch-label">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-uch-muted" />
                <input
                  id="student-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. your.email@example.com"
                  className="uch-input pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="student-phone" className="uch-label">Phone Number</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-uch-muted" />
                <input
                  id="student-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="uch-input pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="student-dob" className="uch-label">Date of Birth</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-uch-muted" />
                <input
                  id="student-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="uch-input pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="student-state" className="uch-label">State of Origin</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-uch-muted" />
                <input
                  id="student-state"
                  type="text"
                  value={stateOfOrigin}
                  onChange={(e) => setStateOfOrigin(e.target.value)}
                  placeholder="Oyo State"
                  className="uch-input pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="student-lga" className="uch-label">Local Government Area (LGA)</label>
              <input
                id="student-lga"
                type="text"
                value={lga}
                onChange={(e) => setLga(e.target.value)}
                placeholder="Ibadan North"
                className="uch-input text-xs"
              />
            </div>

            <div>
              <label htmlFor="student-nationality" className="uch-label">Nationality</label>
              <input
                id="student-nationality"
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Nigerian"
                className="uch-input text-xs"
              />
            </div>

            <div>
              <label htmlFor="student-gender" className="uch-label">Gender</label>
              <select
                id="student-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                className="uch-select text-xs font-bold"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="uch-btn-gold w-full text-xs py-2.5 font-bold shadow-md flex items-center justify-center gap-1.5"
          >
            <User size={14} />
            Save Profile Information
          </button>
        </form>
      </div>

      {/* PIN Update */}
      <div className="glass-card p-5">
        <p className="text-xs font-bold text-uch-muted uppercase tracking-wider mb-4 flex items-center gap-2">
          <Shield size={14} /> Security PIN
        </p>

        {pinSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm mb-4 animate-fade-in">
            <CheckCircle size={16} />
            PIN updated successfully!
          </div>
        )}

        <form onSubmit={handlePinUpdate} className="space-y-4">
          <div>
            <label htmlFor="current-pin" className="uch-label">Current PIN</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-uch-muted" />
              <input
                id="current-pin"
                type={showPins ? 'text' : 'password'}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="Enter current PIN"
                className="uch-input pl-10 pr-10"
                maxLength={10}
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-pin" className="uch-label">New PIN</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-uch-muted" />
              <input
                id="new-pin"
                type={showPins ? 'text' : 'password'}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new PIN (min. 4 digits)"
                className="uch-input pl-10 pr-10"
                maxLength={10}
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirm-pin" className="uch-label">Confirm New PIN</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-uch-muted" />
              <input
                id="confirm-pin"
                type={showPins ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Repeat new PIN"
                className="uch-input pl-10 pr-10"
                maxLength={10}
              />
              <button
                type="button"
                onClick={() => setShowPins(!showPins)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-uch-muted hover:opacity-80 transition-colors"
              >
                {showPins ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <button
            id="update-pin-btn"
            type="submit"
            className="uch-btn-primary w-full flex items-center justify-center gap-2 h-11"
          >
            <Shield size={15} />
            Update Security PIN
          </button>
        </form>
      </div>

      <div className="h-4" />
    </div>
  );
}
