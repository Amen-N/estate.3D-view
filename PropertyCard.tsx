import React from 'react';
import { Property } from '../../types';
import { Bed, Bath, Maximize2, MapPin, Sparkles, Navigation, Calendar, ArrowUpRight, Crown } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
  onScheduleTour?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onScheduleTour,
}) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const fallbackImage =
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85';

  const handleCardClick = () => {
    window.location.href = `/properties/${property.slug}`;
  };

  return (
    <div
      data-testid="property-card"
      onClick={handleCardClick}
      className="group rounded-2xl overflow-hidden border border-slate-800 bg-[#0f172a]/75 hover:border-slate-700 hover:bg-[#0f172a] transition-all duration-300 hover:shadow-xl flex flex-col cursor-pointer relative"
    >
      {/* Image & Floating Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={property.featured_image_url || fallbackImage}
          alt={property.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/40 to-transparent opacity-85" />

        {/* Top Floating Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          {property.has_virtual_showroom ? (
            <span
              data-testid="showroom-badge"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-200 text-[10px] font-mono font-medium tracking-wide shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-slate-300" />
              <span>3D & 360° Showroom</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 text-[11px] font-medium">
              <Crown className="w-3 h-3 text-slate-400" />
              <span>Curated Listing</span>
            </span>
          )}

          <span className="px-2.5 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 text-[10px] font-mono uppercase">
            {property.property_type}
          </span>
        </div>

        {/* Price & PostGIS Distance */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between pointer-events-none">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">
              Valuation
            </span>
            <span className="text-2xl font-display font-bold text-white tracking-tight">
              {formattedPrice}
            </span>
          </div>

          {property.distance_km !== null && property.distance_km !== undefined && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-emerald-400 text-xs font-mono font-medium shadow-sm">
              <Navigation className="w-3 h-3" />
              <span>{property.distance_km} km</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-display font-bold text-white group-hover:text-slate-200 transition-colors line-clamp-1">
              {property.title}
            </h3>
            <div className="p-1 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white transition-colors shrink-0 border border-slate-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-slate-400 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1 font-medium text-slate-300">
              {property.address}, {property.city}
            </span>
          </div>

          {property.description && (
            <p className="mt-2.5 text-slate-400 text-xs line-clamp-2 leading-relaxed">
              {property.description}
            </p>
          )}
        </div>

        {/* Architectural Specs */}
        <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-slate-300 text-xs font-medium">
          <div className="flex items-center gap-1.5" title="Bedrooms">
            <Bed className="w-3.5 h-3.5 text-slate-400" />
            <span>{property.bedrooms} Beds</span>
          </div>

          <div className="flex items-center gap-1.5" title="Bathrooms">
            <Bath className="w-3.5 h-3.5 text-slate-400" />
            <span>{property.bathrooms} Baths</span>
          </div>

          {property.area_sqft && (
            <div className="flex items-center gap-1.5" title="Square Footage">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{Math.round(property.area_sqft).toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          data-testid="schedule-tour-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onScheduleTour) {
              onScheduleTour(property);
            } else {
              window.location.href = `/properties/${property.slug}`;
            }
          }}
          className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 group/btn shadow-sm"
        >
          <Calendar className="w-4 h-4 text-slate-400 group-hover/btn:text-slate-200 transition-colors" />
          <span>Schedule In-Person Tour</span>
        </button>
      </div>
    </div>
  );
};
