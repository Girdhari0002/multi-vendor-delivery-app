const BASE_URL = process.env.BORZO_API_BASE_URL || 'https://robotapitest-in.borzodelivery.com/api/business/1.8';

const call = async (path, body) => {
  if (!process.env.BORZO_API_TOKEN) {
    throw new Error('BORZO_API_TOKEN is not configured');
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-DV-Auth-Token': process.env.BORZO_API_TOKEN,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data.is_successful === false) {
    const message = data.errors?.join(', ') || `Borzo API error (${res.status})`;
    throw new Error(message);
  }
  return data;
};

// Books a two-point courier delivery: pickup from the seller, drop-off to the customer.
export const createDeliveryOrder = ({
  orderId,
  matter,
  pickupAddress,
  pickupName,
  pickupPhone,
  dropAddress,
  dropName,
  dropPhone,
}) =>
  call('/create-order', {
    matter,
    payment_method: process.env.BORZO_PAYMENT_METHOD || 'cash',
    points: [
      {
        address: pickupAddress,
        contact_person: { phone: pickupPhone, name: pickupName },
        client_order_id: `${orderId}-pickup`,
      },
      {
        address: dropAddress,
        contact_person: { phone: dropPhone, name: dropName },
        client_order_id: `${orderId}-drop`,
      },
    ],
  });

export const calculateDeliveryOrder = ({ pickupAddress, dropAddress }) =>
  call('/calculate-order', {
    matter: 'Package',
    points: [{ address: pickupAddress }, { address: dropAddress }],
  });

export const cancelDeliveryOrder = (borzoOrderId) =>
  call('/cancel-order', { order_id: borzoOrderId });
