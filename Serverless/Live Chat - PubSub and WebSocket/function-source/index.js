const functions = require('@google-cloud/functions-framework');
const { PubSub } = require('@google-cloud/pubsub');

const projectId = 'lithe-saga-428213-s4';
const topicId = 'dalvacationhome-concerns';

const pubsub = new PubSub({ projectId });
const topic = pubsub.topic(topicId);

functions.http('send-message', async (req, res) => {
  const { bookingId, senderId, message} = req.body;
  const messageData = {
    bookingId,
    senderId,
    message
  };

  const messageBuffer = Buffer.from(JSON.stringify(messageData));

  // Publish the message
  try {
    const messageId = await topic.publish(messageBuffer);
    res.status(200).send(messageId);
  } catch (error) {
    console.error(`Error publishing message: ${error.message}`);
    res.status(500).send('Error publishing message.');
  }
});