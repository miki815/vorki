import User from '../models/user';
import e, * as express from 'express';
import { pool } from '../server';
import nodemailer from 'nodemailer'
import crypto from 'crypto';
import ResetToken from '../models/reset_token'
import webPush from 'web-push';
import { url } from 'inspector';
const logger = require('../logger');
const moment = require('moment');

function sendTestNotification(subscription, res) {
    logger.info('Sending test notification...');
    const payload = JSON.stringify({ title: 'Uspešna pretplata', body: 'Čestitamo! Uspešno ste se pretplatili na notifikacije.' });
    webPush
        .sendNotification(subscription, payload)
        .then(() => {
            logger.info('Notification sent successfully');
            res.status(200).json({ message: 'Subscription saved and notification sent successfully' });
        })
        .catch((error) => {
            logger.error({ error }, 'Failed to send notification:');
            res.status(500).json({ error: 'Failed to send notification', details: error.message });
        });
}

export class SubscriptionController {

    get_related_subscribers = (req: express.Request, res: express.Response) => {
        const { user_id, job_id, job_title } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Database connection error:', err);
                return res.status(500).json({ error: 'Database connection failed' });
            }

            // Step 1: Get the city for the given user_id
            const getCityQuery = `SELECT location FROM user WHERE id = ?`;
            connection.query(getCityQuery, [user_id], (err, cityResults) => {
                if (err) {
                    console.error('Error fetching user city:', err);
                    connection.release();
                    return res.status(500).json({ error: 'Error fetching user city' });
                }
                if (cityResults.length === 0) {
                    connection.release();
                    return res.status(404).json({ error: 'User not found' });
                }
                const userCity = cityResults[0].location;
                console.log('User city:', userCity);
                // Step 2: Find all related cities in the distances table
                const getRelatedCitiesQuery = `
                SELECT city2 AS related_city
                FROM distances
                WHERE city1 = ?
                UNION
                SELECT city1 AS related_city
                FROM distances
                WHERE city2 = ?
                `;
                connection.query(getRelatedCitiesQuery, [userCity, userCity], (err, relatedCitiesResults) => {
                    if (err) {
                        console.error('Error fetching related cities:', err);
                        connection.release();
                        return res.status(500).json({ error: 'Error fetching related cities' });
                    }

                    const relatedCities = relatedCitiesResults.map((row) => row.related_city);

                    if (relatedCities.length === 0) {
                        connection.release();
                        return res.status(200).json({ message: 'No related cities found', subscribers: [] });
                    }
                    // console.log('Related cities:', relatedCities);
                    // Step 3: Find all subscribers in related cities
                    const getSubscribersQuery = `
                    SELECT DISTINCT u.id, u.location
                    FROM user u
                    JOIN subscriptions s ON u.id = s.user_id
                    WHERE u.location IN (?)
                    `;
                    connection.query(getSubscribersQuery, [relatedCities], (err, subscribersResults) => {
                        connection.release();

                        if (err) {
                            console.error('Error fetching subscribers:', err);
                            return res.status(500).json({ error: err });
                        }
                        const query = `SELECT endpoint, p256dh, auth FROM subscriptions where user_id = ?`;
                        for (const sub of subscribersResults) {
                            console.log('Subscriber:', sub.id);
                            connection.query(query, [sub.id], (err, results) => {
                                if (err) {
                                    logger(req, res).error('Database error:', err);
                                    return res.status(500).json({ error: 'Failed to fetch subscriptions' });
                                }
                                const payload = JSON.stringify({ title: job_title, body: 'Korisniku u vašoj blizini je potrebno završiti posao koji bi mogao biti baš za vas!', url: `https://vorki.rs/oglasi/${job_id}` });
                                results.forEach((subscription) => {
                                    const pushSubscription = {
                                        endpoint: subscription.endpoint,
                                        keys: {
                                            p256dh: subscription.p256dh,
                                            auth: subscription.auth,
                                        },
                                    };
                                    webPush
                                        .sendNotification(pushSubscription, payload)
                                        .then(() => logger.info('Notification sent successfully'))
                                        .catch((err) => logger.error('Notification error:', err));
                                });
                            });
                        }

                        res.status(200).json({
                            message: 'Subscribers found',
                            subscribers: subscribersResults,
                        });
                    });
                });
            });
        });
    }


    inform_master_of_job = (req: express.Request, res: express.Response) => {
        const { job_title, master_id, user_id } = req.body;

        if (!job_title || !master_id || !user_id) {
            return res.status(400).json({ error: 'Job ID, master ID, and user ID are required' });
        }

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Database connection error:', err);
                return res.status(500).json({ error: 'Database connection failed' });
            }

            const query = `SELECT endpoint, p256dh, auth FROM subscriptions where user_id = ?`;
            connection.query(query, [master_id], (err, results) => {
                if (err) {
                    logger(req, res).error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to fetch subscriptions' });
                }
                const payload = JSON.stringify({ title: 'Novi posao', body: `Korisnik je zainteresovan za vaš oglas`, url: `https://vorki.rs/profil/${master_id}` });
                results.forEach((subscription) => {
                    const pushSubscription = {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.p256dh,
                            auth: subscription.auth,
                        },
                    };
                    webPush
                        .sendNotification(pushSubscription, payload)
                        .then(() => logger.info('Notification sent successfully'))
                        .catch((err) => logger.error('Notification error:', err));
                });
                res.status(200).json({
                    message: 'Subscribers found',
                    subscribers: results,
                });
            });
        });
    }


    inform_user_of_master_accept_their_job = (req: express.Request, res: express.Response) => {
        const { job_title, user_id, job_status } = req.body;

        if (!job_title || !user_id) {
            return res.status(400).json({ error: 'Job ID and user ID are required' });
        }

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Database connection error:', err);
                return res.status(500).json({ error: 'Database connection failed' });
            }

            const query = `SELECT endpoint, p256dh, auth FROM subscriptions where user_id = ?`;
            connection.query(query, [user_id], (err, results) => {
                if (err) {
                    logger(req, res).error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to fetch subscriptions' });
                }
                const payload = JSON.stringify({ title: job_title, body: job_status, url: `https://vorki.rs/profil/${user_id}` });
                results.forEach((subscription) => {
                    const pushSubscription = {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.p256dh,
                            auth: subscription.auth,
                        },
                    };
                    webPush
                        .sendNotification(pushSubscription, payload)
                        .then(() => logger.info('Notification sent successfully'))
                        .catch((err) => logger.error('Notification error:', err));
                });
                res.status(200).json({
                    message: 'Subscribers found',
                    subscribers: results,
                });
            });
        });
    }


    subscribe = (req: express.Request, res: express.Response) => {
        const subscription = req.body;
        if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
            logger.error({ subscription }, 'Invalid subscription object');
            return res.status(400).json({ error: 'Invalid subscription object' });
        }
        logger.info('Subscription object details: ' + JSON.stringify(subscription));
        // Provera da li subskripcija već postoji
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Database connection error:', err);
                return res.status(500).json({ error: 'Database connection error' });
            }

            const queryCheck = 'SELECT id FROM subscriptions WHERE endpoint = ?';
            connection.query(queryCheck, [subscription.endpoint], (checkErr, rows) => {
                if (checkErr) {
                    console.error('Error checking subscription:', checkErr);
                    connection.release();
                    return res.status(500).json({ error: 'Database query error' });
                }

                if (rows.length > 0) {
                    // Ako subskripcija postoji, ažuriraj je
                    console.log('Subscription already exists, updating...');
                    const queryUpdate = `
                UPDATE subscriptions
                SET p256dh = ?, auth = ?, updated_at = CURRENT_TIMESTAMP
                WHERE endpoint = ?
              `;
                    connection.query(
                        queryUpdate,
                        [subscription.keys.p256dh, subscription.keys.auth, subscription.endpoint],
                        (updateErr) => {
                            connection.release();
                            if (updateErr) {
                                console.error('Error updating subscription:', updateErr);
                                return res.status(500).json({ error: 'Failed to update subscription' });
                            }
                            sendTestNotification(subscription, res);
                        }
                    );
                } else {
                    // Ako subskripcija ne postoji, ubaci novu
                    console.log('New subscription, inserting...');
                    const queryInsert = `INSERT INTO subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?)`;
                    connection.query(queryInsert, [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth],
                        (insertErr) => {
                            connection.release();
                            if (insertErr) {
                                console.error('Error inserting subscription:', insertErr);
                                return res.status(500).json({ error: 'Failed to save subscription' });
                            }
                            sendTestNotification(subscription, res);
                        }
                    );
                }
            });
        });
    }

    save_subscription = (req: express.Request, res: express.Response) => {
        try {
            const { user_id, sub } = req.body;
            const endpoint = sub.endpoint;
            const p256dh = sub.keys.p256dh;
            const auth = sub.keys.auth;
            if (!endpoint || !p256dh || !auth || !user_id) {
                return res.status(400).json({ error: 'Missing subscription data' });
            }
            logger.info({ user_id }, 'Saving subscription');
            const query = `
        INSERT INTO subscriptions (user_id, endpoint, p256dh, auth)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth), updated_at = CURRENT_TIMESTAMP
        `;
            const values = [user_id, endpoint, p256dh, auth];
            pool.query(query, values, (err, results) => {
                if (err) {
                    logger.error('Greška prilikom pretrage pretplate:', err);
                    return res.status(500).json({ error: 'Greška na serveru.' });
                }
                logger.info({ user_id }, 'Subscription saved/updated');
                sendTestNotification({ endpoint, keys: { p256dh, auth } }, res);
            });
        } catch (err) {
            logger.error('Database error:', err);
            return res.status(500).json({ error: `Database error: ${err.message}` });
        }
    }


    unsubscribe = (req: express.Request, res: express.Response) => {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ error: 'Missing userId' });
            }

            logger.info({ userId }, 'Unsubscribing user');

            const query = 'DELETE FROM subscriptions WHERE user_id = ?';
            pool.query(query, userId, (err, result) => {
                if (err) {
                    logger.error('Greška prilikom pretrage pretplate:', err);
                    return res.status(500).json({ error: 'Greška na serveru.' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Subscription not found' });
                }
                logger.info({ userId }, 'Subscription removed successfully');
                return res.status(200).json({ message: 'Pretplata uspešno isključena.' });
            });
        } catch (err) {
            logger.error('Database error:', err);
            return res.status(500).json({ error: `Database error: ${err.message}` });
        }
    };

    trigger_event = (req: express.Request, res: express.Response) => {
        const { eventData } = req.body;
        pool.getConnection((err, connection) => {
            if (err) {
                logger.error({ err }, 'Database error');
                return res.status(500).json({ error: 'Failed to connect to database' });
            }

            const query = `SELECT endpoint, p256dh, auth FROM subscriptions`;
            connection.query(query, (err, results) => {
                if (err) {
                    logger.error({ err }, 'Database error');
                    return res.status(500).json({ error: 'Failed to fetch subscriptions' });
                }

                const payload = JSON.stringify({ title: eventData.title, body: eventData.body });

                results.forEach((subscription) => {
                    const pushSubscription = {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.p256dh,
                            auth: subscription.auth,
                        },
                    };
                    webPush
                        .sendNotification(pushSubscription, payload)
                        .then(() => logger.info('Notification sent successfully'))
                        .catch((err) => logger.error('Notification error:', err));
                });

                res.status(200).json({ message: 'Notifications triggered' });
            });
        });
    };


}