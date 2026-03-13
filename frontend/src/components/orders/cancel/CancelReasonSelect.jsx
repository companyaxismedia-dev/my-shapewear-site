export default function CancelReasonSelect({ reason, setReason }) {

    const reasons = [
        "I want to change the contact details",
        "Price of the product has now decreased",
        "I want to change the delivery date",
        "I was hoping for a shorter delivery time",
        "I'm worried about the ratings/reviews",
        "My reasons are not listed here",
        "I want to change the size/color/type",
        "I want to change the payment option",
        "I want to change the delivery address"
    ]

    return (

        <div>

            <h2 className="text-lg font-semibold mb-4">
                Reason for Cancellation
            </h2>

            <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded outline-none focus:border-pink-500"
            >

                <option value="">
                    Select Reason
                </option>

                {reasons.map((item, i) => (
                    <option key={i} value={item}>
                        {item}
                    </option>
                ))}

            </select>

            

        </div>

    )

}