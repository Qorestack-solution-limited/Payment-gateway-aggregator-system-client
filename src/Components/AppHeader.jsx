import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  SearchIcon, BellIcon, ChevronDownIcon, ArrowUpRightIcon,
  CheckCircle2Icon, AlertTriangleIcon, InfoIcon, XIcon,
  CheckIcon, Loader2Icon, NetworkIcon, ArrowLeftRightIcon,
  MenuIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  resetNotificationsState,
  selectNotifications,
  selectUnreadCount,
  selectNotifsLoading,
} from "../store/slices/notificationsSlice";
import { searchApi } from "../API/apiClient";

const PAGE_TITLES = {
  "/dashboard":    "Dashboard",
  "/transactions": "Transactions",
  "/gateways":     "Gateways",
  "/analytics":    "Analytics & Reports",
  "/developer":    "Developer",
  "/settings":     "Settings",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_ICON = {
  SUCCESS: <CheckCircle2Icon className="w-4 h-4 text-green-500" />,
  ALERT:   <AlertTriangleIcon className="w-4 h-4 text-amber-500" />,
  WARNING: <AlertTriangleIcon className="w-4 h-4 text-orange-500" />,
  PAYMENT: <ArrowUpRightIcon  className="w-4 h-4 text-blue-500" />,
  INFO:    <InfoIcon          className="w-4 h-4 text-gray-400" />,
};

const STATUS_COLORS = {
  SUCCESS:  "text-green-600 bg-green-50",
  FAILED:   "text-red-600 bg-red-50",
  PENDING:  "text-amber-600 bg-amber-50",
  REFUNDED: "text-blue-600 bg-blue-50",
  ACTIVE:   "text-green-600 bg-green-50",
  INACTIVE: "text-gray-500 bg-gray-100",
  WARNING:  "text-amber-600 bg-amber-50",
};

function formatAmount(amount, currency = "NGN") {
  const n = Number(amount);
  if (isNaN(n)) return `${currency} —`;
  return currency === "NGN"
    ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export function AppHeader({ onMenuToggle }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const notifications  = useSelector(selectNotifications);
  const unreadCount    = useSelector(selectUnreadCount);
  const loading        = useSelector(selectNotifsLoading);

  const [bellOpen, setBellOpen]     = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef(null);
  const bellRef  = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const searchRef    = useRef(null);
  const searchInputRef = useRef(null);
  const debounceRef  = useRef(null);

  const title    = PAGE_TITLES[pathname] ?? "PayOrchestra";
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";

  // Notifications polling
  useEffect(() => {
    if (!user?.id) {
      dispatch(resetNotificationsState());
      return undefined;
    }
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 60_000);
    return () => clearInterval(interval);
  }, [dispatch, user?.id]);

  // Close bell on outside click
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current  && !bellRef.current.contains(e.target)
      ) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  // Close search on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  // Debounced search
  const runSearch = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    try {
      const results = await searchApi.global(q.trim());
      setSearchResults(results);
    } catch {
      setSearchResults({ transactions: [], gateways: [] });
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setSearchOpen(true);
    clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(q), 350);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length >= 2) setSearchOpen(true);
  };

  const handleResultClick = (type, id) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults(null);
    if (type === "transaction") navigate("/transactions");
    if (type === "gateway") navigate(`/gateways/${id}`);
  };

  const handleMarkRead = (id) => dispatch(markNotificationRead(id));

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await dispatch(markAllNotificationsRead());
    setMarkingAll(false);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    dispatch(removeNotification(id));
  };

  const handleBellClick = () => {
    setBellOpen((v) => !v);
    if (!bellOpen) dispatch(fetchNotifications());
  };

  const totalResults = searchResults
    ? (searchResults.transactions?.length ?? 0) + (searchResults.gateways?.length ?? 0)
    : 0;

  return (
    <header className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="flex items-center gap-3 lg:gap-6">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Open menu">
          <MenuIcon className="w-5 h-5" />
        </button>
        <h1 className="text-base lg:text-lg font-black text-[#1A1A1A] tracking-tight">{title}</h1>
        <div className="hidden sm:flex items-center gap-1.5 text-sm">
          <span className="text-gray-400 font-medium">USD/NGN</span>
          <ArrowUpRightIcon className="w-4 h-4 text-[#22C55E]" />
          <span className="text-[#22C55E] font-bold">1,580</span>
        </div>
      </div>

      <div className="flex items-center gap-6">

        {/* Search */}
        <div ref={searchRef} className="relative hidden md:block">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            placeholder="Search transactions, gateways..."
            className="w-72 pl-4 pr-10 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5E63D] focus:border-transparent transition-all shadow-sm placeholder-gray-400 font-medium"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {searchLoading
              ? <Loader2Icon className="w-4 h-4 text-gray-400 animate-spin" />
              : <SearchIcon className="w-4 h-4 text-gray-400" />
            }
          </div>

          {/* Search dropdown */}
          {searchOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 top-12 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              {searchLoading && !searchResults ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Loader2Icon className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm font-medium">Searching…</span>
                </div>
              ) : searchResults && totalResults === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <SearchIcon className="w-6 h-6 mb-2 opacity-40" />
                  <p className="text-sm font-medium">No results for "{searchQuery}"</p>
                </div>
              ) : searchResults ? (
                <div className="max-h-[400px] overflow-y-auto">
                  {searchResults.transactions?.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Transactions
                      </p>
                      {searchResults.transactions.map((tx) => (
                        <button
                          key={tx.id}
                          onClick={() => handleResultClick("transaction", tx.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <ArrowLeftRightIcon className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1A1A1A] truncate">{tx.customerName}</p>
                            <p className="text-xs text-gray-400 font-medium truncate">{tx.reference}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-[#1A1A1A]">{formatAmount(tx.amount, tx.currency)}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[tx.status] ?? "text-gray-500 bg-gray-100"}`}>
                              {tx.status}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.gateways?.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Gateways
                      </p>
                      {searchResults.gateways.map((gw) => (
                        <button
                          key={gw.id}
                          onClick={() => handleResultClick("gateway", gw.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                          <div className="w-8 h-8 rounded-lg bg-[#C5E63D]/20 flex items-center justify-center shrink-0">
                            <NetworkIcon className="w-4 h-4 text-[#5a8a00]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1A1A1A] truncate">{gw.name}</p>
                            <p className="text-xs text-gray-400 font-medium capitalize">{gw.provider?.toLowerCase()}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[gw.status] ?? "text-gray-500 bg-gray-100"}`}>
                            {gw.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/50">
                    <p className="text-[11px] text-gray-400 font-medium text-center">
                      {totalResults} result{totalResults !== 1 ? "s" : ""} — press Enter to see all
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Bell */}
          <div className="relative">
            <button
              ref={bellRef}
              onClick={handleBellClick}
              className="relative p-2 hover:bg-gray-100 rounded-xl transition-all">
              <BellIcon className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white px-0.5">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div
                ref={panelRef}
                className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#1A1A1A]">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      disabled={markingAll}
                      className="flex items-center gap-1 text-xs font-bold text-[#22C55E] hover:text-[#16a34a] transition-colors disabled:opacity-60">
                      {markingAll
                        ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                        : <CheckIcon className="w-3.5 h-3.5" />}
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                  {loading && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-gray-400">
                      <Loader2Icon className="w-5 h-5 animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <BellIcon className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm font-medium">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.isRead && handleMarkRead(n.id)}
                        className={`flex gap-3 px-5 py-4 cursor-pointer group transition-colors ${
                          n.isRead ? "bg-white hover:bg-gray-50" : "bg-blue-50/40 hover:bg-blue-50"
                        }`}>
                        <div className="mt-0.5 shrink-0">
                          {TYPE_ICON[n.type] ?? TYPE_ICON.INFO}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm leading-snug ${n.isRead ? "font-medium text-gray-700" : "font-bold text-[#1A1A1A]"}`}>
                              {n.title}
                            </p>
                            <button
                              onClick={(e) => handleDelete(n.id, e)}
                              className="shrink-0 p-0.5 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all rounded">
                              <XIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 font-medium mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-xs text-gray-400 font-medium mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.isRead && (
                          <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs text-gray-400 font-medium text-center">
                      Showing last {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#1A1A1A] font-bold transition-colors">
            EN <ChevronDownIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-8 bg-gray-200 mx-1" />

          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#1A1A1A]">{fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase() ?? "user"}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#C5E63D]/30 flex items-center justify-center text-[#1A1A1A] font-black text-sm border-2 border-white shadow-sm">
              {initials}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
