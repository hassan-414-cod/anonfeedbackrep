"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Loader2, Search, Shield, ArrowRight } from "lucide-react";
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
      "Web App": "bg-[#E6F0FE] text-blue-800",
      "Mobile App": "bg-[#F3E8FF] text-purple-800",
      "Website": "bg-[#FCE7F3] text-pink-800",
      "Software": "bg-[#F1F5F9] text-slate-800",
      "AI Agent": "bg-[#E6F8F0] text-emerald-800",
      "Design": "bg-[#FEF3C7] text-amber-800",
      "Code": "bg-[#FFEDD5] text-orange-800",
      "Other": "bg-gray-100 text-gray-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const filteredProjects = projects.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col p-4 sm:p-6 lg:p-8">
      {!user && (
        <div className="bg-[#FFF8E7] rounded-3xl p-8 sm:p-14 mb-16 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#FEEB9D] text-black px-4 py-1.5 rounded-full text-xs font-bold mb-6">
              <Shield className="w-4 h-4" /> 100% ANONYMOUS
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-black leading-[1.05] tracking-tight mb-6 uppercase">
              HONEST FEEDBACK.<br/>ZERO JUDGMENT.
            </h1>
            <p className="text-gray-600 text-lg sm:text-xl mb-10 max-w-xl font-medium leading-relaxed">
              Upload your project completely anonymously and get structured, actionable feedback from a community of builders. No real names, no clout chasing.
            </p>
            <Link href="/signup" className="inline-flex items-center justify-center bg-[#FF5A5F] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#ff6e72] transition-colors shadow-sm text-sm tracking-wide uppercase">
              JOIN ANONYMOUSLY <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          {/* Decorative shapes */}
          <div className="absolute right-0 top-0 bottom-0 w-2/3 opacity-40 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-[#FDD85D] rounded-full blur-3xl translate-x-1/3"></div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black tracking-tight mb-1 uppercase">NEWEST UPLOADS</h2>
          <p className="text-gray-500 font-medium">Unbiased feedback for the brave.</p>
        </div>
        <div className="flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-sm">
          <button 
            onClick={() => setSortBy("newest")}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${sortBy === "newest" ? "bg-black text-white" : "bg-white text-gray-500 hover:text-black"}`}
          >
            NEWEST
          </button>
          <button 
            onClick={() => setSortBy("upvoted")}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${sortBy === "upvoted" ? "bg-black text-white" : "bg-white text-gray-500 hover:text-black"}`}
          >
            POPULAR
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        <div className="relative flex-grow lg:max-w-sm xl:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search projects, categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-50 transition-all font-medium text-sm shadow-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center flex-1">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all border ${
                activeCategory === cat 
                  ? "bg-[#FDD85D] border-transparent text-black shadow-sm" 
                  : "bg-white border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50 shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border border-gray-200 rounded-3xl border-dashed">
          <h3 className="text-lg font-bold mb-2 text-gray-900">No projects found</h3>
          <p className="font-medium text-gray-500">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {filteredProjects.map((proj) => (
             <Link href={`/project/${proj.id}`} key={proj.id} className="group bg-white rounded-2xl border border-gray-100 p-6 flex flex-col hover:shadow-xl hover:border-gray-200 transition-all shadow-sm">
               <div className="flex justify-between items-start mb-6">
                 <span className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-md ${getCategoryColor(proj.category)}`}>
                   {proj.category}
                 </span>
                 <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md">
                   {proj.owner_handle}
                 </span>
               </div>
               
               <div className="w-full h-48 bg-gray-50 rounded-xl mb-6 relative overflow-hidden group-hover:opacity-90 transition-opacity flex items-center justify-center border border-gray-100">
                  {(proj.cover_image_url || (proj.file_url && proj.file_type?.startsWith('image/'))) ? (
                    <img src={proj.cover_image_url || proj.file_url} className="w-full h-full object-cover" alt={proj.title} />
                  ) : (
                    <div className="text-gray-400 font-medium text-sm">No Preview Image</div>
                  )}
               </div>

               <div className="flex-grow">
                 <h3 className="text-xl font-bold leading-tight line-clamp-1 mb-2 text-gray-900">{proj.title}</h3>
                 <p className="text-sm text-gray-500 line-clamp-2 font-medium">{proj.description}</p>
               </div>
             </Link>
          ))}
        </div>
      )}
    </div>
  );
}
