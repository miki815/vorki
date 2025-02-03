import User from '../models/user';
import e, * as express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../server';
import nodemailer from 'nodemailer'
import crypto from 'crypto';
import ResetToken from '../models/reset_token'
import webPush from 'web-push';
import { url } from 'inspector';


const logger = require('../logger');
const moment = require('moment');

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
        const {job_title, master_id, user_id } = req.body;

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
        const { job_title, user_id } = req.body;

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
                const payload = JSON.stringify({ title: 'Prihvaćen zahtev za posao!', body: "Pogledajte sve detalje dogovora.", url: `https://vorki.rs/profil/${user_id}` });
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

}