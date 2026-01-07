import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const CheckoutForm = ({ onSuccess }: { onSuccess: (paymentIntentId: string) => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message || 'Une erreur est survenue');
            setLoading(false);
            return;
        }

        const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/reservation/success`,
            },
            redirect: 'if_required',
        });

        if (paymentError) {
            setError(paymentError.message || 'Erreur de paiement');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold"
            >
                {loading ? 'Traitement...' : 'Payer et Confirmer'}
            </Button>
        </form>
    );
};
