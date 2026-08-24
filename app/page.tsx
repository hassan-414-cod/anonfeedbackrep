"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function FeedPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState("newest"); // newest, upvoted
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categoriesList = ["All", "AI Agent", "Web App", "Software", "Website", "Mobile App", "Design", "Code", "Other"];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "projects"), 
        orderBy(sortBy === "newest" ? "created_at" : "upvotes", "desc"), 
        limit(100)
      );
      const snapshot = await getDocs(q);
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Web App": "bg-indigo-100",
      "Mobile App": "bg-blue-100",
      "Website": "bg-pink-100",
      "Software": "bg-slate-200",
      "AI Agent": "bg-[#FFE66D]",
      "Design": "bg-emerald-100",
      "Code": "bg-amber-100",
      "Other": "bg-gray-100"
    };
    return colors[category] || "bg-gray-100";
  };

  const filteredProjects = projects.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full flex-grow flex flex-col p-6 sm:p-8">
      {!user && (
        <div className="bg-[#FFE66D] border-4 border-black p-8 sm:p-12 mb-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
          <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter mb-4 text-[#1A1A1A]">Honest Feedback. Zero Judgment.</h1>
          <p className="text-[#1A1A1A] font-bold text-lg sm:text-xl max-w-2xl mb-8">
            Upload your project completely anonymously and get structured, actionable feedback from a community of builders. No real names, no clout chasing.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/signup" className="px-6 py-3 bg-[#FF6B6B] border-2 border-black font-black uppercase tracking-tighter shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              Join Anonymously
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b-4 border-black gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-[#1A1A1A]">{sortBy === 'newest' ? 'Newest Uploads' : 'Trending This Week'}</h1>
          <p className="text-gray-500 font-bold italic mt-2">Unbiased feedback for the brave.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSortBy("newest")}
            className={`px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-widest ${sortBy === "newest" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
          >
            NEWEST
          </button>
          <button 
            onClick={() => setSortBy("upvoted")}
            className={`px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-widest ${sortBy === "upvoted" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
          >
            POPULAR
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search projects, categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-4 border-black outline-none focus:bg-[#FDFCFB] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all font-bold"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? "bg-[#FFE66D] shadow-[2px_2px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px] text-black" 
                  : "bg-white text-gray-600 hover:text-black hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-black" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white border-4 border-black border-dashed shadow-[6px_6px_0px_rgba(0,0,0,0.2)]">
          <h3 className="text-xl font-black uppercase mb-4">No projects found</h3>
          <p className="font-bold italic text-gray-500 mb-8">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          {filteredProjects.map((proj) => (
             <Link href={`/project/${proj.id}`} key={proj.id} className="border-2 border-black bg-white p-5 flex flex-col space-y-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all">
               <div className="flex justify-between items-start">
                 <span className={`text-[10px] font-black uppercase px-2 py-1 border border-black ${getCategoryColor(proj.category)}`}>
                   {proj.category}
                 </span>
                 <span className="text-[10px] font-mono font-bold opacity-50 bg-gray-100 px-2 py-1 border border-black">
                   {proj.owner_handle}
                 </span>
               </div>
               
               {proj.cover_image_url && (
                 <div className="h-32 border-2 border-black overflow-hidden mb-2">
                   <img src={proj.cover_image_url} alt={proj.title} className="w-full h-full object-cover" />
                 </div>
               )}

               <h3 className="text-xl font-bold leading-tight line-clamp-2">{proj.title}</h3>
               <p className="text-sm text-gray-600 line-clamp-3 italic flex-grow">{proj.description}</p>
               
               <div className="flex items-center justify-between pt-4 border-t-2 border-black border-dashed mt-auto">
                 <div className="flex space-x-4">
                   <div className="flex items-center space-x-1 font-bold text-emerald-600">
                     <span className="text-lg">▲</span> <span>{proj.upvotes || 0}</span>
                   </div>
                   <div className="flex items-center space-x-1 font-bold text-red-600">
                     <span className="text-lg">▼</span> <span>{proj.downvotes || 0}</span>
                   </div>
                 </div>
                 <div className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] border-b-2 border-black pb-0.5 group-hover:text-indigo-600">
                   View Details
                 </div>
               </div>
             </Link>
          ))}
        </div>
      )}
    </div>
  );
}
