'use client';

import { useState, useEffect, useActionState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { placeOrder } from '@/app/actions';
import { useCart } from './CartProvider';
import { calculateDeliveryEstimate, DELIVERY_AREAS } from '@/lib/delivery';
import { getTableNumber, clearTableSession, setTableSession } from '@/lib/tableSession';

export default function CheckoutForm({ session = null }) {
  const searchParams = useSearchParams();
  const { cart, clearCart } = useCart();
  const [state, formAction, isPending] = useActionState(placeOrder, null);

  // Table session handling
  const [tableNumber, setTableNumber] = useState(() => getTableNumber(searchParams));
  const isTableOrder = Boolean(tableNumber);

  // Form field state
  const [name, setName] = useState(session?.id || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [manualTableInput, setManualTableInput] = useState('');
  const [isChangingTable, setIsChangingTable] = useState(false);

  // Sync table from URL or storage
  useEffect(() => {
    const tableFromUrl = searchParams.get('table');
    if (tableFromUrl) {
      setTableSession(tableFromUrl);
      setTableNumber(tableFromUrl);
    } else {
      const active = getTableNumber();
      if (active) setTableNumber(active);
    }
  }, [searchParams]);

  // Clear cart upon successful order
  useEffect(() => {
    if (state?.success && cart.length > 0) {
      clearCart();
    }
  }, [state?.success, cart.length, clearCart]);

  // Delivery estimation (0 ETB for Table orders)
  const deliveryEstimate = useMemo(() => {
    return calculateDeliveryEstimate(address, isTableOrder, tableNumber);
  }, [address, isTableOrder, tableNumber]);

  // Cart subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  }, [cart]);

  const deliveryFee = isTableOrder ? 0 : deliveryEstimate.fee;
  const grandTotal = subtotal + deliveryFee;

  const handleSwitchToDelivery = () => {
    clearTableSession();
    setTableNumber(null);
    setIsChangingTable(false);
  };

  const handleSetTable = (num) => {
    if (!num || !num.trim()) return;
    setTableSession(num.trim());
    setTableNumber(num.trim());
    setIsChangingTable(false);
  };

  // =========================================================================
  // SUCCESS RECEIPT / CONFIRMATION
  // =========================================================================
  if (state?.success) {
    const confirmedOrder = state.order;
    const isTable = Boolean(state.isTableOrder || confirmedOrder?.isTableOrder);
    const tableNum = state.tableNumber || confirmedOrder?.tableNumber;

    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-10 border border-emerald-200/90 dark:border-emerald-800/60 rounded-3xl bg-white dark:bg-stone-900 shadow-md text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
          {isTable ? 'Dine-In Table Order Received' : 'Order Authorized & Dispatched'}
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-0 mb-2">
          Ethiopian Feast Confirmed!
        </h2>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
          Thank you, <strong className="text-stone-900 dark:text-stone-100">{confirmedOrder?.name}</strong>.
          {isTable
            ? ` Your order has been placed for Table #${tableNum}. Our floor staff will serve your freshly rolled injera and wots directly to your table.`
            : ' Our kitchen is preparing your dishes with authentic spices and hot injera.'}
        </p>

        {/* Order Details Receipt Box */}
        <div className="p-5 my-6 rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-left text-xs sm:text-sm space-y-2.5 max-w-md mx-auto">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-stone-700">
            <span className="text-stone-500 dark:text-stone-400 font-semibold">Order ID</span>
            <span className="font-mono font-bold text-stone-900 dark:text-stone-100 bg-stone-200/60 dark:bg-stone-700/60 px-2 py-0.5 rounded">
              {state.orderId}
            </span>
          </div>

          {isTable ? (
            <div className="flex justify-between items-center">
              <span className="text-stone-500 dark:text-stone-400 font-semibold">Service Type</span>
              <span className="font-bold text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60">
                🍽️ Dine-In Table #{tableNum}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-stone-500 dark:text-stone-400 font-semibold">Delivery Area</span>
              <span className="font-medium text-stone-800 dark:text-stone-200">
                {confirmedOrder?.area || 'Bole & Kazanchis'}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-stone-500 dark:text-stone-400 font-semibold">Contact Phone</span>
            <span className="font-mono text-stone-800 dark:text-stone-200">{confirmedOrder?.phone}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500 dark:text-stone-400 font-semibold">Payment</span>
            <span className="font-semibold uppercase tracking-wider text-[11px] text-stone-700 dark:text-stone-300">
              {confirmedOrder?.paymentMethod === 'telebirr'
                ? 'Telebirr SuperApp'
                : confirmedOrder?.paymentMethod === 'cbe'
                ? 'CBE Birr Mobile'
                : isTable
                ? 'Cash at Table'
                : 'Cash on Delivery'}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-stone-200 dark:border-stone-700 text-sm">
            <span className="font-bold text-stone-800 dark:text-stone-200">Total Charged</span>
            <span className="font-extrabold text-amber-900 dark:text-amber-400 text-base">
              {confirmedOrder?.total || grandTotal} ETB
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href={`/orders/${state.orderId}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all no-underline"
          >
            Track Order Status &rarr;
          </Link>

          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-sm shadow-sm transition-all no-underline"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHECKOUT 2-COLUMN VIEW: FORM + DELICACY MANIFEST
  // =========================================================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ---------------------------------------------------------------------
          LEFT COLUMN: CHECKOUT FORM
          --------------------------------------------------------------------- */}
      <div className="lg:col-span-7 space-y-6">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="isTableOrder" value={isTableOrder ? 'true' : 'false'} />
          <input type="hidden" name="tableNumber" value={tableNumber || ''} />
          <input type="hidden" name="paymentMethod" value={paymentMethod} />
          <input type="hidden" name="itemsJson" value={JSON.stringify(cart)} />

          {/* Error Notices */}
          {state?.error && (
            <div
              role="alert"
              className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100 shrink-0">
                Notice
              </span>
              <div>
                <strong className="block font-semibold">Checkout Incomplete</strong>
                <span>{state.error}</span>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 1: DINING MODE (Dine-In Table vs Delivery)
              ================================================================= */}
          <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                  {isTableOrder ? '🍽️' : '🛵'}
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                    {isTableOrder ? 'Dine-In Table Service' : 'Delivery Destination'}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {isTableOrder
                      ? 'Floor service: Served piping hot directly to your table.'
                      : 'Doorstep courier: Dispatched in thermal food pouches.'}
                  </p>
                </div>
              </div>

              {isTableOrder && (
                <button
                  type="button"
                  onClick={handleSwitchToDelivery}
                  className="text-xs font-semibold text-stone-500 hover:text-amber-900 dark:hover:text-amber-400 transition-colors underline cursor-pointer"
                >
                  Switch to Delivery
                </button>
              )}
            </div>

            {isTableOrder ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-900 dark:text-stone-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-amber-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      #{tableNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold m-0">
                        Assigned to Table #{tableNumber}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 m-0">
                        0 ETB Table Service • Served immediately by floor staff
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                      Free Service
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsChangingTable((prev) => !prev)}
                      className="px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-white dark:hover:bg-stone-800 cursor-pointer"
                    >
                      {isChangingTable ? 'Done' : 'Change Table'}
                    </button>
                  </div>
                </div>

                {isChangingTable && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter new Table # (e.g. 4)"
                      value={manualTableInput}
                      onChange={(e) => setManualTableInput(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 w-44"
                    />
                    <button
                      type="button"
                      onClick={() => handleSetTable(manualTableInput)}
                      className="px-3 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-bold hover:bg-amber-950 cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label htmlFor="address" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Delivery Address / Area <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required={!isTableOrder}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Bole Medhanialem, Kazanchis, Piassa, CMC..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-900/20 dark:focus:ring-amber-500/20 focus:border-amber-900 dark:focus:border-amber-500 ${
                      state?.fieldErrors?.address
                        ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20'
                        : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400'
                    }`}
                  />
                  {state?.fieldErrors?.address && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                      {state.fieldErrors.address.join(', ')}
                    </p>
                  )}
                </div>

                {/* Quick Area Suggestion Pills */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1.5">
                    Recognized Addis Neighborhoods:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DELIVERY_AREAS.slice(0, 6).map((area) => (
                      <button
                        key={area.name}
                        type="button"
                        onClick={() => setAddress(area.name)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                      >
                        {area.name} <span className="opacity-60 text-[10px]">({area.fee} ETB)</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Delivery Estimate Pill */}
                {!deliveryEstimate.isEmpty && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-950 dark:text-amber-200">
                      📍 {deliveryEstimate.matchedArea}
                    </span>
                    <span className="font-bold text-amber-900 dark:text-amber-300">
                      {deliveryEstimate.fee} ETB • ETA: {deliveryEstimate.time}
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* =================================================================
              SECTION 2: CUSTOMER CONTACT DETAILS
              ================================================================= */}
          <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                👤
              </span>
              <div>
                <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                  Customer Information
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Used for order notifications and kitchen receipt.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daniel Basaznew"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                />
                {state?.fieldErrors?.name && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {state.fieldErrors.name.join(', ')}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Phone Number <span className="text-rose-600">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0912 345 678"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                />
                {state?.fieldErrors?.phone && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {state.fieldErrors.phone.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* =================================================================
              SECTION 3: PAYMENT METHOD (Telebirr, CBE Birr, Cash)
              ================================================================= */}
          <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                💳
              </span>
              <div>
                <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                  Payment Method
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Official Ethiopian payment gateways and local settlement.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Telebirr */}
              <label
                onClick={() => setPaymentMethod('telebirr')}
                className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'telebirr'
                    ? 'border-amber-600 bg-amber-500/10 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_radio"
                    checked={paymentMethod === 'telebirr'}
                    onChange={() => setPaymentMethod('telebirr')}
                    className="mt-1 w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100">
                        Telebirr SuperApp
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        Instant Pay
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                      Official Ethio Telecom gateway. Instant push prompt to your mobile number.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black tracking-wider text-amber-900 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/60 px-2 py-1 rounded-md shrink-0">
                  TELEBIRR
                </span>
              </label>

              {/* Option 2: CBE Birr */}
              <label
                onClick={() => setPaymentMethod('cbe')}
                className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cbe'
                    ? 'border-amber-600 bg-amber-500/10 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_radio"
                    checked={paymentMethod === 'cbe'}
                    onChange={() => setPaymentMethod('cbe')}
                    className="mt-1 w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100">
                        CBE Birr Mobile
                      </span>
                      <span className="text-[11px] text-stone-400">Commercial Bank of Ethiopia</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                      Direct account transfer via CBE Birr mobile banking authorization.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black tracking-wider text-purple-900 dark:text-purple-300 bg-purple-100/60 dark:bg-purple-900/60 px-2 py-1 rounded-md shrink-0">
                  CBE BIRR
                </span>
              </label>

              {/* Option 3: Cash */}
              <label
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-amber-600 bg-amber-500/10 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_radio"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="mt-1 w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100">
                        {isTableOrder ? 'Cash at Table' : 'Cash on Delivery'}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {isTableOrder ? 'Floor Waiter' : 'Physical Settlement'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                      {isTableOrder
                        ? 'Pay cash or local mobile transfer to the floor waiter upon dining service.'
                        : 'Pay exact cash or local mobile transfer to the courier upon arrival.'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black tracking-wider text-emerald-900 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/60 px-2 py-1 rounded-md shrink-0">
                  CASH
                </span>
              </label>
            </div>
          </section>

          {/* =================================================================
              SECTION 4: SPECIAL INSTRUCTIONS
              ================================================================= */}
          <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-2">
            <label htmlFor="specialInstructions" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              {isTableOrder ? 'Floor Waiter & Kitchen Notes' : 'Courier & Kitchen Notes'}{' '}
              <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              rows="2"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra spicy awaze, extra teff injera roll, bring sparkling Ambo water first..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20"
            />
          </section>

          {/* Submit Order Button */}
          <button
            type="submit"
            disabled={isPending || cart.length === 0}
            className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wide text-white bg-amber-900 hover:bg-amber-950 dark:bg-amber-600 dark:hover:bg-amber-500 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>🔒</span>
            <span>
              {isPending
                ? 'Authorizing Order with Kitchen...'
                : `Authorize & Place Order • ${grandTotal} ETB`}
            </span>
          </button>
        </form>
      </div>

      {/* ---------------------------------------------------------------------
          RIGHT COLUMN: DELICACY MANIFEST (Order Summary Sidebar)
          --------------------------------------------------------------------- */}
      <aside className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-5 lg:sticky lg:top-24">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              Delicacy Manifest
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {cart.length} item{cart.length === 1 ? '' : 's'} in order
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-extrabold text-xs">
            ETB
          </span>
        </div>

        {/* Items List */}
        {cart.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs">
            Your shopping cart is empty.{' '}
            <Link href="/menu" className="text-amber-900 dark:text-amber-400 font-bold underline">
              Browse dishes
            </Link>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-stone-100 dark:border-stone-800/60 last:border-0"
              >
                <div>
                  <p className="font-bold text-stone-900 dark:text-stone-100 m-0">
                    {item.name}
                  </p>
                  <span className="text-[11px] text-stone-400">
                    {item.quantity} × {item.price} ETB
                  </span>
                </div>
                <span className="font-black text-stone-900 dark:text-stone-100">
                  {item.price * item.quantity} ETB
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pricing Totals Breakdown */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>Items Subtotal</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {subtotal} ETB
            </span>
          </div>

          <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
            <span>
              {isTableOrder
                ? `Dine-In Service (Table #${tableNumber})`
                : `Delivery Fee (${deliveryEstimate.matchedArea || 'Addis Ababa'})`}
            </span>
            <span
              className={`font-semibold ${
                isTableOrder
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {isTableOrder
                ? 'FREE (0 ETB)'
                : deliveryEstimate.isEmpty
                ? '—'
                : `${deliveryFee} ETB`}
            </span>
          </div>

          <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100 block">
                Grand Total
              </span>
              <span className="text-[10px] text-stone-400">
                Fresh Teff Injera & Spices Included
              </span>
            </div>
            <span className="text-2xl font-black text-amber-900 dark:text-amber-400">
              {grandTotal} <span className="text-xs font-bold">ETB</span>
            </span>
          </div>
        </div>

        <div className="pt-2 text-center">
          <Link
            href="/cart"
            className="text-xs font-semibold text-stone-500 hover:text-amber-900 dark:hover:text-amber-400 transition-colors no-underline"
          >
            &larr; Modify Bag & Quantities
          </Link>
        </div>
      </aside>
    </div>
  );
}