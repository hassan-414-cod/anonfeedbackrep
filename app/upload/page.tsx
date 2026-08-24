"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web App");
  const [description, setDescription] = useState("");
  const [linkOrUrl, setLinkOrUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [downloadPermission, setDownloadPermission] = useState("download_allowed");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadCount, setUploadCount] = useState(0);
  const [checkingLimits, setCheckingLimits] = useState(true);

  useEffect(() => {
    const checkUploads = async () => {
      if (user) {
        try {
          const q = query(collection(db, "projects"), where("owner_user_id", "==", user.uid));
          const snapshot = await getDocs(q);
          setUploadCount(snapshot.size);
        } catch (err) {
          console.error(err);
        }
      }
      setCheckingLimits(false);
    };
    checkUploads();
  }, [user]);

  if (!user || !userProfile) {
    return (
      <div className="w-full max-w-lg mx-auto p-12 mt-12 text-center bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Log in to Upload</h2>
        <p className="text-gray-600 font-bold mb-8">You need an account to upload projects and receive feedback.</p>
        <Link href="/login" className="inline-block px-8 py-4 bg-black text-white font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,0.3)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          Go to Login
        </Link>
      </div>
    );
  }

  const isPro = userProfile.subscription_status === 'active';
  const maxUploads = isPro ? Infinity : 5;
  const maxFileSize = isPro ? 500 * 1024 * 1024 : 50 * 1024 * 1024;

  if (!checkingLimits && uploadCount >= maxUploads) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto mt-12 bg-[#FFE66D] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Upload Limit Reached</h2>
        <p className="text-gray-800 font-bold mb-6">You have reached the maximum of {maxUploads} uploads on the Free plan.</p>
        <Link href="/billing" className="bg-black text-white px-6 py-3 font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(255,255,255,0.5)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all inline-block">
          Upgrade to PRO
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUploadProgress(0);
    
    try {
      let uploadedFileUrl = "";
      let fileType = "";
      let fileName = "";
      let fileSize = 0;

      if (file) {
        if (file.size > maxFileSize) {
          throw new Error(`File exceeds ${isPro ? '500MB' : '50MB'} limit. Please upgrade or choose a smaller file.`);
        }
        
        fileType = file.type;
        fileName = file.name;
        fileSize = file.size;

        const storageRef = ref(storage, `projects/${user.uid}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadedFileUrl = (await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (err) => reject(err),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        })) as string;
      }

      await addDoc(collection(db, "projects"), {
        owner_user_id: user.uid,
        owner_handle: userProfile.anonymous_handle,
        title,
        category,
        description,
        link_or_file_url: linkOrUrl,
        file_url: uploadedFileUrl,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        download_permission: downloadPermission,
        cover_image_url: coverUrl || (uploadedFileUrl && fileType.startsWith('image/') ? uploadedFileUrl : `https://picsum.photos/seed/${Math.random()}/800/400`),
        upvotes: 0,
        downvotes: 0,
        created_at: serverTimestamp()
      });
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Failed to upload project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex-grow">
      <div className="bg-white border-4 border-black p-8 sm:p-12 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
        <div className="absolute top-0 right-0 p-4">
          <span className="text-[10px] font-mono font-bold bg-[#FFE66D] px-2 py-1 border-2 border-black uppercase">
            {userProfile.anonymous_handle}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter mb-2">Upload Project</h1>
        <p className="text-gray-500 font-bold italic mb-8">Get anonymous, honest feedback from the community. {isPro ? 'Unlimited uploads.' : `${uploadCount}/5 free uploads used.`}</p>
        
        {error && <div className="bg-[#FF6B6B] border-2 border-black text-white font-bold p-3 mb-6 uppercase text-sm tracking-wide">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest">Project Title</label>
            <input required maxLength={80} type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 border-2 border-black outline-none focus:bg-[#FDFCFB] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all font-bold" placeholder="e.g. FocusFlow - Minimalist Timer" />
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 border-2 border-black outline-none focus:bg-[#FDFCFB] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all bg-white font-bold cursor-pointer">
              <option>Web App</option>
              <option>Mobile App</option>
              <option>Website</option>
              <option>Software</option>
              <option>AI Agent</option>
              <option>Design</option>
              <option>Code</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest">Description</label>
            <textarea required rows={4} maxLength={500} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 border-2 border-black outline-none focus:bg-[#FDFCFB] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all font-bold italic resize-none" placeholder="What is it? Whom is it for? What specific feedback are you looking for?" />
          </div>

          <div className="space-y-4 pt-4 border-t-2 border-black border-dashed">
            <h3 className="font-black uppercase tracking-widest">Project Files / Links</h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest flex items-center justify-between">
                <span>File Upload</span>
                <span className="text-gray-400">Max {isPro ? '500MB' : '50MB'}</span>
              </label>
              <input 
                type="file" 
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
                className="w-full px-4 py-3 border-2 border-black outline-none focus:bg-[#FDFCFB] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all font-bold bg-white" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest">Or External Link</label>
              <input type="url" value={linkOrUrl} onChange={e => setLinkOrUrl(e.target.value)} className="w-full px-4 py-3 border-2 border-black outline-none focus:bg-[#FDFCFB] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all font-bold" placeholder="https://" />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest">Download Permission</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="downloadPermission" value="download_allowed" checked={downloadPermission === "download_allowed"} onChange={e => setDownloadPermission(e.target.value)} className="accent-black w-4 h-4" />
                  <span className="font-bold text-sm">Download Allowed</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="downloadPermission" value="view_only" checked={downloadPermission === "view_only"} onChange={e => setDownloadPermission(e.target.value)} className="accent-black w-4 h-4" />
                  <span className="font-bold text-sm">View Only</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="downloadPermission" value="off" checked={downloadPermission === "off"} onChange={e => setDownloadPermission(e.target.value)} className="accent-black w-4 h-4" />
                  <span className="font-bold text-sm">Off</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t-2 border-black border-dashed">
            <label className="block text-xs font-black uppercase tracking-widest">Cover Image URL <span className="opacity-50">(Optional)</span></label>
            <input type="url" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} className="w-full px-4 py-3 border-2 border-black outline-none focus:bg-[#FDFCFB] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all font-bold" placeholder="https://" />
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mt-1">Leave blank to auto-generate a placeholder image.</p>
          </div>

          <div className="pt-8 border-t-4 border-black border-dashed flex justify-end items-center">
             {loading && uploadProgress > 0 && <span className="mr-4 font-bold italic text-sm">{Math.round(uploadProgress)}% Uploaded</span>}
             <button disabled={loading} type="submit" className="bg-[#FF6B6B] border-2 border-black font-black uppercase tracking-tighter shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all py-3 px-8 text-lg disabled:opacity-50 flex items-center">
               {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
               Upload Project +
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
