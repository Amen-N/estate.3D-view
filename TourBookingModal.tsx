import React, { useState, useEffect } from 'react';
import { Property, AvailabilitySlot, Tour } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { fetchAvailabilityApi, bookTourApi, getCalendarIcsUrl } from '../../services/api';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  MapPin,
  Sparkles,
  Crown,
} from 'lucide-react';

interface TourBookingModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TourBookingModal: React.FC<TourBookingModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const { isAuthenticated, token, openAuthModal } = useAuth();

  // Tomorrow's date in YYYY-MM-DD format as standard starting point
  const getInitialDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [buyerNotes, setBuyerNotes] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedTour, setConfirmedTour] = useState<Tour | null>(null);

  // Load availability when property or selectedDate changes
  useEffect(() => {
    if (!isOpen || !property || !selectedDate) return;

    let isMounted = true;
    setLoadingSlots(true);
    setBookingError(null);
    setSelectedSlot(null);

    fetchAvailabilityApi(property.id, selectedDate)
      .then((data) => {
        if (isMounted) {
          setSlots(data.slots || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setBookingError(err.message || 'Failed to fetch agent availability.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingSlots(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, property, selectedDate]);

  // Reset confirmation when modal opens for a new property
  useEffect(() => {
    if (isOpen) {
      setConfirmedTour(null);
      setBookingError(null);
      setBuyerNotes('');
    }
  }, [isOpen, property?.id]);

  if (!isOpen || !property) return null;

  const formatSlotTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    if (!isAuthenticated || !token) {
      // Intercept unauthenticated user and return back to slot selector on login
      openAuthModal('login', () => {
        // Will continue with selectedSlot preserved
      });
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const tour = await bookTourApi(
        property.id,
        {
          scheduled_start: selectedSlot.start_time,
          scheduled_end: selectedSlot.end_time,
          buyer_notes: buyerNotes.trim() || undefined,
        },
        token
      );
      setConfirmedTour(tour);
    } catch (err: any) {
      setBookingError(
        err.message ||
          'Conflict detected: This slot was just booked by another buyer. Please select an alternate interval.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="tour-booking-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Silver Accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Header */}
        <div className="relative p-6 border-b border-white/05 bg-slate-900/40">
          <button
            type="button"
            data-testid="tour-modal-close-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/05 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono font-medium uppercase tracking-wider mb-2">
            <Crown className="w-4 h-4 text-slate-400" />
            <span>VIP Concierge In-Person Viewing</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-semibold text-white line-clamp-1">
            {confirmedTour ? 'Viewing Reservation Secured!' : `Schedule Private Showing`}
          </h2>

          <div className="mt-1 flex items-center gap-1.5 text-slate-400 text-sm">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="line-clamp-1 font-medium">
              {property.title} — {property.address}, {property.city}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {confirmedTour ? (
            /* Success State Banner */
            <div
              data-testid="booking-success-banner"
              className="p-6 rounded-xl bg-slate-900/70 border border-white/10 space-y-4 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>

              <div>
                <h3 className="text-xl font-display font-semibold text-white">Viewing Confirmed</h3>
                <p className="mt-1 text-xs text-slate-400 font-mono">
                  Concierge Booking ID: <code className="font-mono text-slate-200 font-semibold">{confirmedTour.id}</code>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#030712] border border-slate-800 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Time:</span>
                  <span className="text-white font-medium">
                    {new Date(confirmedTour.scheduled_start).toLocaleDateString()} at{' '}
                    {formatSlotTime(confirmedTour.scheduled_start)} -{' '}
                    {formatSlotTime(confirmedTour.scheduled_end)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Residence:</span>
                  <span className="text-white font-medium">{property.title}</span>
                </div>
                {confirmedTour.agent && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Broker:</span>
                    <span className="text-sky-400 font-medium">{confirmedTour.agent.full_name}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  data-testid="download-ics-btn"
                  href={getCalendarIcsUrl(confirmedTour.id)}
                  download={`tour_${confirmedTour.id}.ics`}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>Download Calendar (.ics)</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition border border-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {bookingError && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Select Viewing Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    data-testid="tour-date-picker"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030712] border border-slate-800 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition text-sm"
                  />
                  <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Slot Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Available 45-Minute Private Intervals
                  </label>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>15 min buffer</span>
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-8 text-center text-slate-400 text-sm animate-pulse font-mono">
                    Calculating conflict-free agent intervals...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-sm bg-[#030712] rounded-xl border border-slate-800">
                    No viewing intervals available for this date. Please select an alternate day.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {slots.map((slot, index) => {
                      const isSelected = selectedSlot?.start_time === slot.start_time;

                      if (!slot.is_available) {
                        return (
                          <div
                            key={index}
                            className="p-2.5 rounded-xl bg-[#030712]/50 border border-slate-900/80 text-slate-600 text-xs font-medium text-center line-through cursor-not-allowed font-mono"
                            title="Interval already reserved"
                          >
                            {formatSlotTime(slot.start_time)}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={index}
                          type="button"
                          data-testid="available-slot-pill"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                            isSelected
                              ? 'bg-white text-slate-950 shadow-sm border border-white'
                              : 'bg-[#030712] hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 font-mono'
                          }`}
                        >
                          {formatSlotTime(slot.start_time)} - {formatSlotTime(slot.end_time)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Buyer Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Special Viewing Requests / Inquiries (Optional)
                </label>
                <textarea
                  data-testid="buyer-notes-input"
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  placeholder="e.g. Inquiring regarding private elevator access, parking spaces, and architectural finish warranties."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030712] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition text-sm resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  data-testid="confirm-booking-btn"
                  disabled={!selectedSlot || isSubmitting}
                  className={`shimmer-gold-btn w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                    !selectedSlot || isSubmitting
                      ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                      : 'bg-white hover:bg-slate-100 text-slate-950'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>
                    {isSubmitting
                      ? 'Locking GiST Reservation...'
                      : selectedSlot
                      ? `Confirm Private Viewing for ${formatSlotTime(selectedSlot.start_time)}`
                      : 'Select a Viewing Interval Above'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
