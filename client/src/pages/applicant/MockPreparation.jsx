import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Play, Calendar, Video, CheckCircle2, User, Mic, CheckCircle } from "lucide-react";

const MockPreparation = () => {
  const { backendUrl, user, token } = useContext(AppContext);
  const [interviews, setInterviews] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState(false);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [calendarConnected, setCalendarConnected] = useState(false);

  // Self scheduling states
  const [selectedInterviewer, setSelectedInterviewer] = useState("");
  const [objective, setObjective] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const fetchMyInterviews = async () => {
    try {
      const firebaseToken = await user?.getIdToken();
      const authToken = token || firebaseToken;
      if (!authToken) {
        setLoading(false);
        return;
      }
      const { data } = await axios.get(`${backendUrl}/api/interviews/my-interviews`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (data.success) {
        setInterviews(data.interviews);
      }
    } catch (error) {
      toast.error("Failed to fetch assigned interviews: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewers = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/interviews/interviewers`);
      if (data.success) {
        setInterviewers(data.interviewers);
        if (data.interviewers.length > 0) {
          setSelectedInterviewer(data.interviewers[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching AI interviewers: ", error.message);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      const firebaseToken = await user?.getIdToken();
      const authToken = token || firebaseToken;
      if (!authToken) {
        toast.error("Authentication required");
        return;
      }
      const { data } = await axios.get(`${backendUrl}/api/calendar/auth`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      toast.error("Failed to connect Google Calendar: " + error.message);
    }
  };

  const checkCalendarConnection = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar_auth") === "success") {
      setCalendarConnected(true);
      toast.success("Google Calendar successfully connected!");
      // Remove query parameter to avoid infinite toasts on reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleScheduleOwn = async (e) => {
    e.preventDefault();
    if (!selectedInterviewer || !scheduleTime) {
      toast.error("Please fill in interviewer style and schedule date/time.");
      return;
    }

    setScheduling(true);
    const interviewer = interviewers.find(i => i.id === Number(selectedInterviewer));

    try {
      const firebaseToken = await user?.getIdToken();
      const authToken = token || firebaseToken;
      const { data } = await axios.post(
        `${backendUrl}/api/interviews/schedule-own`,
        {
          interviewerId: interviewer.agent_id,
          interviewerName: interviewer.name,
          objective,
          scheduleTime,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (data.success) {
        toast.success("Self mock interview scheduled successfully!");
        setObjective("");
        setScheduleTime("");
        fetchMyInterviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to schedule interview: " + error.message);
    } finally {
      setScheduling(false);
    }
  };

  const handleStartCall = async (interview) => {
    try {
      setActiveCall(true);
      toast.info("Connecting to AI Voice agent...");
      const firebaseToken = await user?.getIdToken();
      const authToken = token || firebaseToken;
      
      const { data } = await axios.post(
        `${backendUrl}/api/interviews/register-call`,
        { agentId: interview.interviewerId, interviewId: interview.id },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (data.success && data.registerCallResponse) {
        setCurrentCallId(data.registerCallResponse.call_id);
        toast.success("AI Voice Agent Connected! Start speaking.");
      }
    } catch (error) {
      setActiveCall(false);
      toast.error("Failed to start voice session: " + error.message);
    }
  };

  const handleEndCall = () => {
    setActiveCall(false);
    setCurrentCallId(null);
    toast.success("Voice practice call ended successfully.");
    fetchMyInterviews();
  };

  useEffect(() => {
    if (user) {
      fetchMyInterviews();
      fetchInterviewers();
      checkCalendarConnection();
    } else {
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading interview sessions...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">AI Preparation Center</h2>
          <p className="text-gray-500 mt-1">
            Improve your communication, speech flow, and subject matter understanding with voice assessments.
          </p>
        </div>
        <div>
          {calendarConnected ? (
            <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-200 shadow-sm">
              <CheckCircle size={18} />
              <span className="text-sm font-semibold">Calendar Connected</span>
            </div>
          ) : (
            <button
              onClick={handleConnectCalendar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
            >
              <Calendar size={18} />
              Connect Google Calendar
            </button>
          )}
        </div>
      </div>

      {activeCall && (
        <div className="bg-brand-navy text-white rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-xl animate-pulse">
          <div className="p-4 bg-brand-orange rounded-full">
            <Mic size={48} className="text-white animate-bounce" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Mock Assessment In Progress</h3>
            <p className="text-sm text-gray-300 mt-1">Speak clearly. The AI interviewer is listening and will evaluate your answers.</p>
          </div>
          <button
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
          >
            End and Submit Interview
          </button>
        </div>
      )}

      {!activeCall && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Interview List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
              <Video className="text-blue-500" size={20} />
              Scheduled Voice Assessments
            </h3>
            {interviews.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center text-gray-500 shadow-inner">
                No interviews scheduled yet. Use the scheduler on the right to set up your first mock practice!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {interviews.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          item.status === "completed" ? "bg-green-50 text-green-600 border border-green-150" : "bg-blue-50 text-blue-600 border border-blue-150"
                        }`}>
                          {item.status === "completed" ? "Completed" : "Scheduled"}
                        </span>
                        {item.calendarEventUrl && (
                          <a
                            href={item.calendarEventUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <Calendar size={12} /> Google Calendar
                          </a>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">
                        Assessment with {item.interviewerName}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{item.objective}</p>
                      <div className="text-xs text-gray-400">
                        Scheduled: {new Date(item.scheduleTime).toLocaleString()}
                      </div>
                    </div>

                    {item.status !== "completed" && (
                      <button
                        onClick={() => handleStartCall(item)}
                        className="mt-6 w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <Play size={16} /> Start Voice Practice
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Self Scheduler Sidebar */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
              <Calendar className="text-blue-500" size={18} />
              Schedule Mock Practice
            </h3>
            <form onSubmit={handleScheduleOwn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  AI Interviewer & Domain
                </label>
                <select
                  value={selectedInterviewer}
                  onChange={(e) => setSelectedInterviewer(e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  {interviewers.map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Objective / Focus Areas
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. React hooks, behavioral fit, or SQL optimizations."
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={scheduling}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                {scheduling ? "Scheduling..." : "Schedule Session"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockPreparation;
