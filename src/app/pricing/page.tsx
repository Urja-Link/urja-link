'use client';
import { useState } from 'react';
import { getStripe } from '@/lib/stripe';

export default function PricingPage() {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleCheckout = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            // Initiate the Stripe checkout session
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'test-user-id' }) // Replace with actual user ID from Auth context
            });
            const data = await res.json();

            if (data.error) {
                setErrorMsg(data.error);
                setLoading(false);
                return;
            }

            if (data.sessionId) {
                // Redirect via Stripe frontend client
                const stripe = await getStripe();
                const { error } = await stripe?.redirectToCheckout({ sessionId: data.sessionId }) || {};

                if (error) {
                    setErrorMsg(error.message || 'Payment redirect failed');
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setErrorMsg('An unexpected error occurred. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-8 pt-24 font-sans">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-emerald-400">Upgrade to Urja-Link Pro</h1>
            <p className="max-w-2xl text-center mb-12 text-slate-300 text-lg">
                Unlock full access to the AI Solar Diagnostic Engine, unlimited drone 3D digital twin imports, and predictive ROI modeling for your entire energy company fleet.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Basic Tier */}
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center backdrop-blur-md opacity-70">
                    <h2 className="text-2xl font-semibold mb-2">Free Pier</h2>
                    <div className="text-4xl font-bold mb-6 text-slate-200">
                        ₹0 <span className="text-base text-slate-500 font-normal">/mo</span>
                    </div>
                    <ul className="text-left mb-8 space-y-4 w-full px-6 flex-grow">
                        <li className="flex items-center"><span className="text-emerald-500 mr-2">✔</span> Basic Analytics</li>
                        <li className="flex items-center"><span className="text-emerald-500 mr-2">✔</span> Local Storage Modeling</li>
                        <li className="flex items-center text-slate-500"><span className="mr-2">❌</span> AI Diagnostics</li>
                        <li className="flex items-center text-slate-500"><span className="mr-2">❌</span> 3D Digital Twin</li>
                    </ul>
                    <button
                        className="w-full bg-slate-700 text-slate-300 font-bold py-4 rounded-xl cursor-not-allowed"
                        disabled
                    >
                        Current Plan
                    </button>
                </div>

                {/* Pro Tier */}
                <div className="bg-slate-800/80 p-8 rounded-2xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] border border-emerald-500/30 flex flex-col items-center text-center backdrop-blur-xl relative transform md:-translate-y-4 transition-all duration-300 hover:shadow-[0_0_50px_-5px_rgba(16,185,129,0.4)]">
                    <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-emerald-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Most Popular
                    </div>
                    <h2 className="text-2xl font-semibold mb-2 text-emerald-100">Pro Tier</h2>
                    <div className="text-5xl font-bold mb-6 text-emerald-400">
                        ₹1,500 <span className="text-lg text-emerald-500/70 font-normal">/mo</span>
                    </div>

                    <ul className="text-left mb-8 space-y-4 w-full px-6 flex-grow">
                        <li className="flex items-center"><span className="text-emerald-400 mr-3">✔</span> AI Diagnostic Limits Unlocked</li>
                        <li className="flex items-center"><span className="text-emerald-400 mr-3">✔</span> Priority GPU Rendering</li>
                        <li className="flex items-center"><span className="text-emerald-400 mr-3">✔</span> Automatic Maintenance Alerts</li>
                        <li className="flex items-center"><span className="text-emerald-400 mr-3">✔</span> Live Operations Command</li>
                    </ul>

                    {errorMsg && <p className="text-red-400 text-sm mb-4">{errorMsg}</p>}

                    <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full bg-emerald-500 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-105 text-slate-900 font-extrabold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? 'Processing Secure Checkout...' : 'Subscribe Now'}
                    </button>
                </div>
            </div>

            <p className="mt-12 text-slate-500 text-sm">
                * Payments are securely processed via Stripe. You can cancel your subscription at any time.
            </p>
        </div>
    );
}
