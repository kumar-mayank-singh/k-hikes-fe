import { CheckCircle } from "lucide-react";

interface BookingSuccessHeaderProps {
  bookingNumber?: string;
}

export function BookingSuccessHeader({
  bookingNumber,
}: BookingSuccessHeaderProps): React.ReactElement {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>
      <h1 className="text-2xl font-bold text-emerald-700">Booking confirmed!</h1>
      {bookingNumber ? (
        <p className="text-stone-600 text-sm mt-2">
          Booking # <strong className="text-stone-900">{bookingNumber}</strong>
        </p>
      ) : null}
      <p className="text-stone-500 text-xs mt-1">
        A confirmation email is on its way.
      </p>
    </div>
  );
}
