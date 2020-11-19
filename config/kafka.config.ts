import {EachMessagePayload, Kafka} from 'kafkajs';

const KAFKA_BROKERS = process.env.KAFKA_BROKERS.split(',');

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: KAFKA_BROKERS,
    ssl: true,
    sasl: {
        mechanism: 'scram-sha-256',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
    },
});

export const createConsumer = async (topic: string, eachMessage: (payload: EachMessagePayload) => Promise<void>) => {
    const consumer = kafka.consumer({groupId: process.env.KAFKA_GROUP_ID});
    await consumer.connect();
    await consumer.subscribe({topic, fromBeginning: true});
    return consumer.run({eachMessage});
};

export const createProducer = async () => {
    const producer = kafka.producer();
    await producer.connect();
    return producer;
};
