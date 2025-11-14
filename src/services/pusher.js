import Pusher from "pusher-js";

const pusherKey = process.env.PUSHER_KEY;
if (!pusherKey) {
  throw new Error('PUSHER_KEY environment variable is not set');
}

export default new Pusher(pusherKey, {
  channelAuthorization: {
    endpoint: "/authenticate",
    transport: "ajax",
  },
});
