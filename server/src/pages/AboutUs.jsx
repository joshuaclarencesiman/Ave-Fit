import { useState } from "react";
import { MapPin, Phone, Clock, Star } from "lucide-react";

export default function AboutUs() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!feedback.name || !feedback.message || rating === 0) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFeedback({ name: "", email: "", message: "" });
    setRating(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-900/40 to-slate-950 px-6 pt-12 pb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-400">AveFit</h1>
        <p className="text-slate-400 mt-2">Avenue Power and Fitness Gym</p>
        <div className="flex justify-center gap-1 mt-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-slate-400 text-sm ml-2">5.0 Rating</span>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* About */}
        <div className="bg-slate-800 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-3">About the Gym</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Avenue Power and Fitness Gym is dedicated to helping every member achieve their fitness goals
            through personalized training, state-of-the-art equipment, and a supportive community.
            AveFit is our digital companion app designed to make your fitness journey smarter and more effective.
          </p>
        </div>

        {/* Gym Info */}
        <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-white mb-1">Gym Information</h2>
          {[
            { icon: <MapPin size={18} />, label: "Address", value: "Tanauan City, Batangas, Philippines" },
            { icon: <Phone size={18} />, label: "Contact", value: "+63 (0) 912 345 6789" },
            { icon: <Clock size={18} />, label: "Hours", value: "Mon–Sat: 5:00 AM – 10:00 PM\nSunday: 7:00 AM – 6:00 PM" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <div className="text-blue-400 mt-0.5 flex-shrink-0">{item.icon}</div>
              <div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-sm text-white whitespace-pre-line">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Services */}
        <div className="bg-slate-800 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-3">Our Services</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🏋️", label: "Weight Training" },
              { icon: "🏃", label: "Cardio Area" },
              { icon: "🧘", label: "Yoga Classes" },
              { icon: "🥊", label: "Boxing" },
              { icon: "🍎", label: "Nutrition Coaching" },
              { icon: "📱", label: "AveFit App" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900 rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl">{s.icon}</span>
                <span className="text-sm text-slate-300">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-slate-800 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-1">Send Feedback</h2>
          <p className="text-slate-400 text-xs mb-4">We'd love to hear from you!</p>

          {/* Star Rating */}
          <div className="mb-4">
            <p className="text-sm text-slate-300 mb-2">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      star <= (hovered || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Name *</label>
              <input type="text" value={feedback.name}
                onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                placeholder="Your name"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input type="email" value={feedback.email}
                onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                placeholder="your@email.com (optional)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Message *</label>
              <textarea rows={4} value={feedback.message}
                onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                placeholder="Share your experience..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          {submitted && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm text-center mb-3">
              ✓ Thank you for your feedback!
            </div>
          )}

          <button onClick={handleSubmit}
            disabled={!feedback.name || !feedback.message || rating === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-sm">
            Submit Feedback
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs pb-4">
          AveFit v1.0 — Batangas State University Capstone Project 2026
        </p>
      </div>
    </div>
  );
}