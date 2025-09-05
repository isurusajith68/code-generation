// import express from "express";

const express = require("express");
// const router = express.Router();
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { entry_db_pool } from "../db/db.js";

const { entry_db_pool } = require("../db/db");
// import { getTenantPool } from "../db/get-tenant-dbpool.js";
// import { requireAuth } from "../middleware/auth-middleware.js";
// import { tenantMiddleware } from "../middleware/tenant-middleware.js";
// import {
//   sendIssueEmail,
//   sendIssueEmailReply,
//   sendSubscriptionReminder,
// } from "../utils/send-mail.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import nodemailer from "nodemailer";
// import { v4 as uuidv4 } from "uuid";
// import { exec, spawn } from "child_process";
// import fspromises from "fs/promises";
// import { promisify } from "util";
// import { writeFile, readFile } from "fs/promises";
const systemAdminRouter = express.Router();

// systemAdminRouter.get("/health", (req, res) => {
//   res.status(200).send("OK");
// });

// systemAdminRouter.get("/get-subscribers", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 1;
//     const offset = (page - 1) * limit;
//     const search = req.query.search || "";
//     const type = req.query.type === "All" ? "" : req.query.type || "";
//     const deleted = (req.query.deleted === "true" ? true : false) || false;
//     const query = `
//     SELECT
//       s.id,
//       s.org_id,
//       s.expiry_date,
//       s.started_date,
//       s.type,
//       s.payment_verified,
//       s.payment_proof,
//       s.deleted,
//       o.name AS hotelname,
//       o.email AS email,
//       o.label AS label
//     FROM
//       subscription s
//     JOIN
//       organizations o ON s.org_id = o.id
//     WHERE
//       o.name ILIKE $1 AND s.type ILIKE $2 AND s.deleted = $5
//     ORDER BY
//       s.id DESC
//     LIMIT
//       $3
//     OFFSET
//       $4
//   `;

//     const result = await entry_db_pool.query(query, [
//       `%${search}%`,
//       `%${type}%`,
//       limit,
//       offset,
//       deleted,
//     ]);

//     const total = await entry_db_pool.query(
//       `SELECT COUNT(*) AS total
//             FROM   subscription s
//             JOIN   organizations o
//             ON     s.org_id = o.id
//             WHERE  o.name ILIKE $1  AND s.type ILIKE $2 AND s.deleted = $3`,
//       [`%${search}%`, `%${type}%`, deleted]
//     );
//     const metaData = {
//       total: total.rows[0].total,
//       page: page,
//       limit: limit,
//       totalPages: Math.ceil(total.rows[0].total / limit),
//     };

//     res.json({
//       data: result.rows,
//       metaData: metaData,
//     });
//   } catch (error) {
//     console.error(error.message);
//   }
// });

// systemAdminRouter.get(
//   "/get-subscriber",
//   // requireAuth,
//   // tenantMiddleware,
//   async (req, res) => {
//     try {
//       const organization_id = req.organization_id;
//       console.log("organization_id", organization_id);
//       const result = await entry_db_pool.query(
//         `SELECT
//       s.id,
//       s.org_id,
//       s.expiry_date,
//       s.started_date,
//       s.type,
//       s.payment_verified,
//       s.payment_proof,
//       s.deleted,
//       o.name AS hotelname,
//       o.email AS email,
//       o.label AS label
//     FROM
//       subscription s
//     JOIN
//       organizations o ON s.org_id = o.id
//     WHERE
//       s.org_id = $1`,
//         [organization_id]
//       );
//       if (result.rows.length > 0) {
//         return res.json({
//           data: result.rows,
//           message: "Subscription found!",
//         });
//       } else {
//         return res.json({
//           data: [],
//           message: "Subscription not found!",
//         });
//       }
//     } catch (error) {
//       console.error(error.message);
//     }
//   }
// );

// const __dirname = path.resolve();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, "./files/payment-proof");

//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const extension = path.extname(file.originalname);
//     cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF, JPEG, or PNG files are allowed!"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// systemAdminRouter.post(
//   "/subscription-payment",
//   upload.single("file"),
//   requireAuth,
//   tenantMiddleware,
//   async (req, res) => {
//     try {
//       const file = req.file;
//       const organization_id = req.organization_id;
//       console.log("organization_id", organization_id);
//       if (!file) {
//         return res.status(400).json({ message: "Please upload a file" });
//       }

//       const org = await entry_db_pool.query(
//         `SELECT * FROM organizations WHERE id = $1`,
//         [organization_id]
//       );

//       if (org.rows.length === 0) {
//         return res.status(404).json({ message: "Organization not found!" });
//       }

//       const result = await entry_db_pool.query(
//         `INSERT INTO subscription (org_id,payment_proof,payment_verified,type)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *`,
//         [organization_id, file.filename, false, "Paid"]
//       );

//       if (result.rows.length === 0) {
//         return res
//           .status(500)
//           .json({ message: "Error uploading payment proof!" });
//       }

//       res.json({
//         message: "Payment proof uploaded successfully!",
//         data: result.rows[0],
//       });
//     } catch (error) {
//       console.error(error.message);
//     }
//   }
// );

// systemAdminRouter.get("/file", async (req, res) => {
//   const { downloadFile } = req.query;
//   if (downloadFile) {
//     const fileToDownload = downloadFile;

//     const filePath = path.join(
//       __dirname,
//       "./files/payment-proof",
//       fileToDownload
//     );

//     if (fs.existsSync(filePath)) {
//       return res.sendFile(filePath);
//     } else {
//       return res.status(404).json({ message: "File not found" });
//     }
//   } else {
//     return res.json({
//       data: [],
//     });
//   }
// });

// systemAdminRouter.put("/remove-subscription/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await entry_db_pool.query(
//       `SELECT * FROM subscription WHERE id = $1`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Subscription not found!" });
//     }

//     await entry_db_pool.query(
//       `UPDATE subscription SET deleted = true WHERE id = $1`,
//       [id]
//     );

//     res.json({ message: "Subscription deleted successfully!" });
//   } catch (error) {
//     console.error(error.message);
//   }
// });

// systemAdminRouter.put("/restore-subscription/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await entry_db_pool.query(
//       `SELECT * FROM subscription WHERE id = $1`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Subscription not found!" });
//     }

//     await entry_db_pool.query(
//       `UPDATE subscription SET deleted = false WHERE id = $1`,
//       [id]
//     );

//     res.json({ message: "Subscription restored successfully!" });
//   } catch (error) {
//     console.error(error.message);
//   }
// });

// systemAdminRouter.delete(
//   "/delete-removed-subscription/:id",
//   async (req, res) => {
//     try {
//       const { id } = req.params;

//       const result = await entry_db_pool.query(
//         `SELECT * FROM subscription WHERE id = $1`,
//         [id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: "Subscription not found!" });
//       }

//       await entry_db_pool.query(`DELETE FROM subscription WHERE id = $1`, [id]);

//       res.json({ message: "Subscription deleted successfully!" });
//     } catch (error) {
//       console.error(error.message);
//     }
//   }
// );

// systemAdminRouter.put("/extend-subscription", async (req, res) => {
//   try {
//     const { id, days, label } = req.body;
//     console.log(label, "label");
//     const result = await entry_db_pool.query(
//       `SELECT * FROM subscription WHERE id = $1`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Subscription not found!" });
//     }

//     const expiaryDate = result.rows[0].expiry_date;
//     const newExpiaryDate = new Date(expiaryDate);

//     newExpiaryDate.setDate(newExpiaryDate.getDate() + parseInt(days));

//     await entry_db_pool.query(
//       `UPDATE subscription SET expiry_date = $1 WHERE id = $2`,
//       [newExpiaryDate, id]
//     );

//     const pool = await getTenantPool(label);
//     await pool.query(`SET search_path TO ${label}`);

//     if (!pool) {
//       return res.status(404).json({ message: "Tenant not found!" });
//     }

//     const loadProperty = await pool.query(`SELECT * FROM operation_property`);
//     if (loadProperty.rows.length === 0) {
//       return res.status(404).json({ message: "Property not found!" });
//     }

//     for (const property of loadProperty.rows) {
//       console.log("property", property);
//       await pool.query(
//         `UPDATE operation_property SET expiry_date = $1 WHERE id = $2`,
//         [newExpiaryDate, property.id]
//       );
//     }

//     res.json({ message: "Subscription extended successfully!" });
//   } catch (error) {
//     console.error("Error extending subscription:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// systemAdminRouter.put("/approve-subscription", async (req, res) => {
//   try {
//     const { id, years, label } = req.body;

//     const result = await entry_db_pool.query(
//       `SELECT * FROM subscription WHERE id = $1`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Subscription not found!" });
//     }

//     const today = new Date();
//     const startDate = new Date(today);

//     const newExpiaryDate = new Date(today);
//     newExpiaryDate.setFullYear(today.getFullYear() + parseInt(years));

//     await entry_db_pool.query(
//       `UPDATE subscription SET payment_verified = $1,expiry_date=$2,started_date=$3 WHERE id = $4`,
//       [true, newExpiaryDate, startDate, id]
//     );

//     const pool = await getTenantPool(label);
//     await pool.query(`SET search_path TO ${label}`);

//     if (!pool) {
//       return res.status(404).json({ message: "Tenant not found!" });
//     }

//     const loadProperty = await pool.query(`SELECT * FROM operation_property`);

//     if (loadProperty.rows.length === 0) {
//       return res.status(404).json({ message: "Property not found!" });
//     }

//     loadProperty.rows.map((property) => {
//       pool.query(
//         `UPDATE operation_property SET expiry_date = $1 WHERE id = $2`,
//         [newExpiaryDate, property.id]
//       );
//     });

//     res.json({ message: "Subscription extended successfully!" });
//   } catch (error) {
//     console.error("Error extending subscription:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// systemAdminRouter.get("/getroomtypes", async (req, res) => {
//   try {
//     // Ensure tenantPool exists

//     // Fetch room types, rooms, and amenities in parallel
//     // Fetch room types
//     const roomTypesResult = await entry_db_pool.query(
//       `SELECT * FROM core_data.core_roomtypes`
//     );
//     const roomTypes = roomTypesResult.rows ?? [];

//     // // Fetch rooms/views
//     // const roomsViewResult = await entry_db_pool.query(
//     //   `SELECT * FROM core_data.core_view`
//     // );
//     // const roomsViews = roomsViewResult.rows ?? [];

//     // // Fetch rooms/views
//     // const roomclassResult = await entry_db_pool.query(
//     //   `SELECT * FROM operation_roomreclass`
//     // );
//     // const roomsClass = roomclassResult.rows ?? [];

//     // // Fetch room amenities
//     // const roomAmenitiesResult = await entry_db_pool.query(
//     //   `SELECT * FROM core_data.core_amenities`
//     // );
//     // const roomAmenities = roomAmenitiesResult.rows ?? [];

//     res.status(200).json({
//       success: true,
//       roomTypes,
//     });
//   } catch (error) {
//     console.error("Error fetching room types:", error.message);

//     res.status(500).json({
//       success: false,
//       error: "An error occurred while fetching room types.",
//       details: error.message, // Helps in debugging
//     });
//   }
// });

// const storageTickets = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(__dirname, "./files/tickets");
//     fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
//     cb(null, uniqueFilename);
//   },
// });

// const uploadTickets = multer({
//   storage: storageTickets,
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedFileTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/gif",
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "text/plain",
//     ]; //format allowed ex doc, docx, pdf, txt ,

//     if (allowedFileTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(
//         new Error(
//           "Invalid file type. Only images, PDFs, docs, and text files are allowed."
//         ),
//         false
//       );
//     }
//   },
// });

// const uploadTicketFiles = (req, res, next) => {
//   uploadTickets.array("files", 5)(req, res, function (err) {
//     if (err instanceof multer.MulterError) {
//       if (err.code === "LIMIT_FILE_SIZE") {
//         return res.status(400).json({
//           message: "File size too large. Maximum allowed is 10MB per file.",
//         });
//       }
//       return res.status(400).json({ message: err.message });
//     } else if (err) {
//       return res.status(400).json({ message: err.message });
//     }
//     next();
//   });
// };

// systemAdminRouter.post(
//   "/tickets",
//   requireAuth,
//   tenantMiddleware,
//   uploadTicketFiles,
//   async (req, res) => {
//     try {
//       const { title, issue: message } = req.body;
//       const organization_id = req.organization_id;
//       const user_id = req.user;
//       const pool = req.tenantPool;
//       const eid = req.eid;

//       const org = await entry_db_pool.query(
//         `SELECT * FROM organizations WHERE id = $1`,
//         [organization_id]
//       );

//       if (org.rows.length === 0) {
//         if (req.files && req.files.length > 0) {
//           req.files.forEach((file) => {
//             fs.unlinkSync(file.path);
//           });
//         }
//         return res.status(404).json({ message: "Organization not found!" });
//       }

//       const employee = await pool.query(
//         `SELECT * FROM operation_employee oe JOIN operation_person op ON oe.person_id = op.id WHERE oe.id = $1`,
//         [eid]
//       );

//       if (employee.rows.length === 0) {
//         if (req.files && req.files.length > 0) {
//           req.files.forEach((file) => {
//             fs.unlinkSync(file.path);
//           });
//         }
//         return res.status(404).json({ message: "Employee not found!" });
//       }

//       const employee_name =
//         employee.rows[0].first_name + " " + employee.rows[0].last_name;

//       const user = await pool.query(`SELECT * FROM auth_users WHERE id = $1`, [
//         user_id,
//       ]);

//       if (user.rows.length === 0) {
//         if (req.files && req.files.length > 0) {
//           req.files.forEach((file) => {
//             fs.unlinkSync(file.path);
//           });
//         }
//         return res.status(404).json({ message: "User not found!" });
//       }

//       const allowedPriorities = ["Low", "Normal", "High", "Urgent", "Critical"];
//       const priority = req.body.priority || "Normal";

//       if (!allowedPriorities.includes(priority)) {
//         if (req.files && req.files.length > 0) {
//           req.files.forEach((file) => {
//             fs.unlinkSync(file.path);
//           });
//         }
//         return res.status(400).json({
//           message: `Invalid priority. Allowed values are: ${allowedPriorities.join(
//             ", "
//           )}`,
//         });
//       }

//       const client = await entry_db_pool.connect();

//       try {
//         await client.query("BEGIN");

//         const ticketResult = await client.query(
//           `INSERT INTO tickets (
//             title, organization_name, organization_id, email, message,
//             user_id, employee_name, priority
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//           RETURNING id`,
//           [
//             title,
//             org.rows[0].name,
//             organization_id,
//             user.rows[0].username,
//             message,
//             user_id,
//             employee_name,
//             priority,
//           ]
//         );

//         const ticketId = ticketResult.rows[0].id;

//         if (req.files && req.files.length > 0) {
//           await client.query(`
//             CREATE TABLE IF NOT EXISTS ticket_attachments (
//               id SERIAL PRIMARY KEY,
//               ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
//               reply_id INTEGER REFERENCES operation_ticket_reply(id) ON DELETE CASCADE,
//               filename TEXT NOT NULL,
//               original_filename TEXT NOT NULL,
//               file_path TEXT NOT NULL,
//               file_type TEXT NOT NULL,
//               file_size INTEGER NOT NULL,
//               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//               CONSTRAINT check_ticket_or_reply CHECK (
//                 (ticket_id IS NOT NULL AND reply_id IS NULL) OR
//                 (ticket_id IS NULL AND reply_id IS NOT NULL)
//               )
//             )
//           `);

//           for (const file of req.files) {
//             await client.query(
//               `INSERT INTO ticket_attachments (
//                 ticket_id, filename, original_filename, file_path, file_type, file_size
//               ) VALUES ($1, $2, $3, $4, $5, $6)`,
//               [
//                 ticketId,
//                 path.basename(file.path),
//                 file.originalname,
//                 file.path,
//                 file.mimetype,
//                 file.size,
//               ]
//             );
//           }
//         }

//         await client.query("COMMIT");

//         sendIssueEmail(user.rows[0].username, title, ticketId);

//         const completeTicket = await entry_db_pool.query(
//           `SELECT t.*,
//             COALESCE(
//               json_agg(
//                 json_build_object(
//                   'id', ta.id,
//                   'filename', ta.filename,
//                   'original_filename', ta.original_filename,
//                   'file_type', ta.file_type,
//                   'file_size', ta.file_size
//                 )
//               ) FILTER (WHERE ta.id IS NOT NULL),
//               '[]'::json
//             ) as attachments
//           FROM tickets t
//           LEFT JOIN ticket_attachments ta ON t.id = ta.ticket_id AND ta.reply_id IS NULL
//           WHERE t.id = $1
//           GROUP BY t.id`,
//           [ticketId]
//         );

//         res.json({
//           message: "Ticket created successfully!",
//           data: completeTicket.rows[0],
//         });
//       } catch (error) {
//         await client.query("ROLLBACK");
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error creating ticket:", error.message);
//       res
//         .status(500)
//         .json({ message: "Error creating ticket: " + error.message });
//     }
//   }
// );

// systemAdminRouter.get("/get-tickets", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || "";
//     const closed = req.query.type === "true" ? true : false;
//     const offset = (page - 1) * limit;

//     const ticketQuery = `
//       SELECT
//         id, title, organization_name, organization_id, email, message, user_id,
//         priority, created_at, closed
//       FROM
//         tickets
//       WHERE
//         closed = $3 AND organization_name ILIKE $4
//       ORDER BY
//         id DESC
//       LIMIT
//         $1
//       OFFSET
//         $2
//     `;

//     const tickets = await entry_db_pool.query(ticketQuery, [
//       limit,
//       offset,
//       closed,
//       `%${search}%`,
//     ]);

//     const ticketIds = tickets.rows.map((t) => t.id);

//     let replies = [];
//     let ticketAttachments = [];
//     let replyAttachments = [];

//     if (ticketIds.length > 0) {
//       const replyQuery = `
//         SELECT
//           r.id as reply_id, r.ticket_id, r.reply, r.reply_title, r.reply_date, r.replied_by,
//           COALESCE(
//             json_agg(
//               json_build_object(
//                 'id', ta.id,
//                 'filename', ta.filename,
//                 'original_filename', ta.original_filename,
//                 'file_type', ta.file_type,
//                 'file_size', ta.file_size
//               )
//             ) FILTER (WHERE ta.id IS NOT NULL),
//             '[]'::json
//           ) as attachments
//         FROM
//           operation_ticket_reply r
//         LEFT JOIN ticket_attachments ta ON r.id = ta.reply_id
//         WHERE
//           r.ticket_id = ANY($1)
//         GROUP BY r.id, r.ticket_id, r.reply, r.reply_title, r.reply_date, r.replied_by
//         ORDER BY
//           r.reply_date DESC
//       `;

//       const replyResult = await entry_db_pool.query(replyQuery, [ticketIds]);
//       replies = replyResult.rows;

//       const tableExists = await entry_db_pool.query(`
//         SELECT EXISTS (
//           SELECT FROM information_schema.tables
//           WHERE table_name = 'ticket_attachments'
//         );
//       `);

//       if (tableExists.rows[0].exists) {
//         const ticketAttachmentQuery = `
//           SELECT
//             id, ticket_id, filename, original_filename, file_type, file_size, created_at
//           FROM
//             ticket_attachments
//           WHERE
//             ticket_id = ANY($1) AND reply_id IS NULL
//           ORDER BY
//             created_at DESC
//         `;

//         const ticketAttachmentResult = await entry_db_pool.query(
//           ticketAttachmentQuery,
//           [ticketIds]
//         );
//         ticketAttachments = ticketAttachmentResult.rows.map((attachment) => {
//           const fileUrl = `${attachment.filename}`;
//           let thumbnailUrl = null;
//           if (attachment.file_type.startsWith("image/")) {
//             thumbnailUrl = fileUrl;
//           }

//           return {
//             ...attachment,
//             file_url: fileUrl,
//             thumbnail_url: thumbnailUrl,
//           };
//         });
//       }
//     }

//     const ticketMap = {};
//     tickets.rows.forEach((ticket) => {
//       ticketMap[ticket.id] = {
//         ...ticket,
//         replies: [],
//         ticket_attachments: [],
//       };
//     });

//     replies.forEach((reply) => {
//       if (ticketMap[reply.ticket_id]) {
//         ticketMap[reply.ticket_id].replies.push(reply);
//       }
//     });

//     ticketAttachments.forEach((attachment) => {
//       if (ticketMap[attachment.ticket_id]) {
//         ticketMap[attachment.ticket_id].ticket_attachments.push(attachment);
//       }
//     });

//     const finalData = Object.values(ticketMap);

//     const totalResult = await entry_db_pool.query(
//       `SELECT COUNT(*) AS total FROM tickets WHERE
//        closed = $1 AND organization_name ILIKE $2`,
//       [closed, `%${search}%`]
//     );

//     const metaData = {
//       total: totalResult.rows[0].total,
//       page: page,
//       limit: limit,
//       totalPages: Math.ceil(totalResult.rows[0].total / limit),
//     };

//     res.json({ data: finalData.reverse(), metaData });
//   } catch (error) {
//     console.error("Error getting tickets:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
// systemAdminRouter.get("/tickets-file", async (req, res) => {
//   const { downloadFile } = req.query;
//   if (downloadFile) {
//     const fileToDownload = downloadFile;

//     const filePath = path.join(__dirname, "./files/tickets", fileToDownload);

//     if (fs.existsSync(filePath)) {
//       return res.sendFile(filePath);
//     } else {
//       return res.status(404).json({ message: "File not found" });
//     }
//   } else {
//     return res.json({
//       data: [],
//     });
//   }
// });

// systemAdminRouter.put(
//   "/reply-ticket/:id",
//   uploadTicketFiles,
//   async (req, res) => {
//     const client = await entry_db_pool.connect();

//     try {
//       const { reply, title } = req.body;
//       const { id } = req.params;

//       await client.query("BEGIN");

//       const ticketResult = await client.query(
//         `SELECT * FROM tickets WHERE id = $1`,
//         [id]
//       );
//       console.log("ticketResult", ticketResult.rows);
//       if (ticketResult.rows.length === 0) {
//         if (req.files && req.files.length > 0) {
//           req.files.forEach((file) => {
//             fs.unlinkSync(file.path);
//           });
//         }
//         return res.status(404).json({ message: "Ticket not found!" });
//       }

//       const ticket = ticketResult.rows[0];

//       const replyResult = await client.query(
//         `INSERT INTO operation_ticket_reply (reply_title, reply, ticket_id, replied_by)
//       VALUES ($1, $2, $3, $4)
//       RETURNING *`,
//         [title, reply, id, "System Admin"]
//       );

//       const replyId = replyResult.rows[0].id;

//       if (req.files && req.files.length > 0) {
//         for (const file of req.files) {
//           await client.query(
//             `INSERT INTO ticket_attachments (
//             reply_id, filename, original_filename, file_path, file_type, file_size
//           ) VALUES ($1, $2, $3, $4, $5, $6)`,
//             [
//               replyId,
//               path.basename(file.path),
//               file.originalname,
//               file.path,
//               file.mimetype,
//               file.size,
//             ]
//           );
//         }
//       }

//       await client.query("COMMIT");

//       sendIssueEmailReply(
//         ticket.email,
//         title,
//         reply,
//         ticket.employee_name,
//         ticket.id,
//         ticket.organization_name
//       );

//       const completeReply = await entry_db_pool.query(
//         `SELECT r.*,
//         COALESCE(
//           json_agg(
//             json_build_object(
//               'id', ra.id,
//               'filename', ra.filename,
//               'original_filename', ra.original_filename,
//               'file_type', ra.file_type,
//               'file_size', ra.file_size
//             )
//           ) FILTER (WHERE ra.id IS NOT NULL),
//           '[]'::json
//         ) as attachments
//       FROM operation_ticket_reply r
//       LEFT JOIN
//       ticket_attachments ra ON r.id = ra.reply_id
//       WHERE r.id = $1
//       GROUP BY r.id,r.reply_title,r.reply,r.ticket_id,r.replied_by,r.reply_date`,
//         [replyId]
//       );

//       res.json({
//         message: "Ticket replied successfully!",
//         reply: completeReply.rows[0],
//       });
//     } catch (error) {
//       await client.query("ROLLBACK");

//       if (req.files && req.files.length > 0) {
//         req.files.forEach((file) => {
//           fs.unlinkSync(file.path);
//         });
//       }

//       console.error("Error replying to ticket:", error.message);
//       res
//         .status(500)
//         .json({ message: "Error replying to ticket: " + error.message });
//     } finally {
//       client.release();
//     }
//   }
// );

// systemAdminRouter.put(
//   "/user-reply-ticket/:id",
//   requireAuth,
//   tenantMiddleware,
//   (req, res, next) => {
//     uploadTicketFiles(req, res, (err) => {
//       if (err) {
//         console.error("File upload error:", err);
//         return res.status(400).json({
//           message: "File upload error: " + err.message,
//         });
//       }
//       next();
//     });
//   },
//   async (req, res) => {
//     const client = await entry_db_pool.connect();

//     try {
//       const { reply, title } = req.body;
//       const { id } = req.params;
//       const eid = req.eid;
//       const pool = req.tenantPool;

//       if (!reply) {
//         if (req.files && req.files.length > 0) {
//           req.files.forEach((file) => {
//             fs.unlinkSync(file.path);
//           });
//         }
//         return res.status(400).json({
//           message: "Reply  are required!",
//         });
//       }

//       await client.query("BEGIN");

//       const ticketResult = await client.query(
//         `SELECT * FROM tickets WHERE id = $1`,
//         [id]
//       );

//       if (ticketResult.rows.length === 0) {
//         if (req.files && req.files.length > 0) {
//           req.files.forEach((file) => {
//             fs.unlinkSync(file.path);
//           });
//         }
//         return res.status(404).json({ message: "Ticket not found!" });
//       }

//       const ticket = ticketResult.rows[0];

//       const employee = await pool.query(
//         `SELECT * FROM operation_employee oe JOIN operation_person op ON oe.person_id = op.id WHERE oe.id = $1`,
//         [eid]
//       );

//       if (employee.rows.length === 0) {
//         if (req.files && req.files.length > 0) {
//           req.files.forEach((file) => {
//             fs.unlinkSync(file.path);
//           });
//         }
//         return res.status(404).json({ message: "Employee not found!" });
//       }

//       const employee_name =
//         employee.rows[0].first_name + " " + employee.rows[0].last_name;

//       const replyResult = await client.query(
//         `INSERT INTO operation_ticket_reply (reply_title, reply, ticket_id, replied_by)
//       VALUES ($1, $2, $3, $4)
//       RETURNING *`,
//         [title, reply, id, employee_name]
//       );

//       const replyId = replyResult.rows[0].id;

//       if (req.files && req.files.length > 0) {
//         for (const file of req.files) {
//           await client.query(
//             `INSERT INTO ticket_attachments (
//             reply_id, filename, original_filename, file_path, file_type, file_size
//           ) VALUES ($1, $2, $3, $4, $5, $6)`,
//             [
//               replyId,
//               path.basename(file.path),
//               file.originalname,
//               file.path,
//               file.mimetype,
//               file.size,
//             ]
//           );
//         }
//       }

//       await client.query("COMMIT");

//       // sendIssueEmailReply(
//       //   ticket.email,
//       //   title,
//       //   reply,
//       //   ticket.employee_name,
//       //   ticket.id,
//       //   ticket.organization_name
//       // );

//       const completeReply = await entry_db_pool.query(
//         `SELECT r.*,
//         COALESCE(
//           json_agg(
//             json_build_object(
//               'id', ra.id,
//               'filename', ra.filename,
//               'original_filename', ra.original_filename,
//               'file_type', ra.file_type,
//               'file_size', ra.file_size
//             )
//           ) FILTER (WHERE ra.id IS NOT NULL),
//           '[]'::json
//         ) as attachments
//       FROM operation_ticket_reply r
//       LEFT JOIN
//       ticket_attachments
//       ra ON r.id = ra.reply_id
//       WHERE r.id = $1
//       GROUP BY r.id,r.reply_title,r.reply,r.ticket_id,r.replied_by,r.reply_date`,
//         [replyId]
//       );

//       res.json({
//         message: "Ticket replied successfully!",
//         reply: completeReply.rows[0],
//       });
//     } catch (error) {
//       await client.query("ROLLBACK");

//       if (req.files && req.files.length > 0) {
//         req.files.forEach((file) => {
//           fs.unlinkSync(file.path);
//         });
//       }
//       console.error("Error replying to ticket:", error.message);
//       res
//         .status(500)
//         .json({ message: "Error replying to ticket: " + error.message });
//     } finally {
//       client.release();
//     }
//   }
// );

// systemAdminRouter.put("/close-ticket/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const ticketResult = await entry_db_pool.query(
//       `SELECT * FROM tickets WHERE id = $1`,
//       [id]
//     );

//     if (ticketResult.rows.length === 0) {
//       return res.status(404).json({ message: "Ticket not found!" });
//     }

//     await entry_db_pool.query(
//       `UPDATE tickets SET closed = true WHERE id = $1`,
//       [id]
//     );

//     res.json({ message: "Ticket closed successfully!" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// systemAdminRouter.delete("/delete-ticket/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await entry_db_pool.query(
//       `SELECT * FROM tickets WHERE id = $1`,
//       [id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Ticket not found!" });
//     }
//     await entry_db_pool.query(
//       `DELETE FROM operation_ticket_reply WHERE ticket_id = $1`,
//       [id]
//     );

//     await entry_db_pool.query(`DELETE FROM tickets WHERE id = $1`, [id]);

//     res.json({
//       message: "Ticket and associated replies deleted successfully!",
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// systemAdminRouter.put("/update-ticket/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { priority } = req.body;

//     const result = await entry_db_pool.query(
//       `SELECT * FROM tickets WHERE id = $1`,
//       [id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Ticket not found!" });
//     }

//     await entry_db_pool.query(
//       `UPDATE tickets SET priority = $1 WHERE id = $2`,
//       [priority, id]
//     );

//     res.json({ message: "Ticket  updated successfully!" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// systemAdminRouter.get(
//   "/get-org-tickets",
//   requireAuth,
//   tenantMiddleware,
//   async (req, res) => {
//     try {
//       const pool = entry_db_pool;
//       const orgId = req.organization_id;

//       if (!orgId) {
//         return res
//           .status(400)
//           .json({ message: "Organization ID is required." });
//       }

//       const query = `
//         SELECT
//           t.id, t.title, t.organization_name, t.organization_id, t.email,
//           t.message, t.user_id, t.priority, t.created_at, t.closed,
//           COUNT(DISTINCT CASE WHEN ta.reply_id IS NULL THEN ta.id END) as ticket_attachment_count,
//           COUNT(DISTINCT CASE WHEN ta.reply_id IS NOT NULL THEN ta.id END) as reply_attachment_count,
//           COUNT(DISTINCT otr.id) as reply_count
//         FROM tickets t
//         LEFT JOIN ticket_attachments ta ON t.id = ta.ticket_id
//         LEFT JOIN operation_ticket_reply otr ON t.id = otr.ticket_id
//         WHERE t.organization_id = $1
//         GROUP BY t.id, t.title, t.organization_name, t.organization_id, t.email,
//                  t.message, t.user_id, t.priority, t.created_at, t.closed
//         ORDER BY t.created_at DESC
//       `;

//       const result = await pool.query(query, [orgId]);

//       if (result.rows.length === 0) {
//         return res
//           .status(404)
//           .json({ message: "No tickets found for this organization." });
//       }

//       res.status(200).json({ tickets: result.rows });
//     } catch (error) {
//       console.error("Error fetching organization tickets:", error);
//       res
//         .status(500)
//         .json({ message: "Internal server error", error: error.message });
//     }
//   }
// );

// systemAdminRouter.get("/get-org-ticket/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const ticketResult = await entry_db_pool.query(
//       `SELECT
//     tickets.*,
//     COALESCE(
//       json_agg(
//         json_build_object(
//           'id', ta.id,
//           'filename', ta.filename,
//           'original_filename', ta.original_filename,
//           'file_type', ta.file_type,
//           'file_size', ta.file_size
//         )
//       ) FILTER (WHERE ta.id IS NOT NULL),
//       '[]'::json
//     ) as attachments
//   FROM tickets
//   LEFT JOIN ticket_attachments ta ON tickets.id = ta.ticket_id
//   WHERE tickets.id = $1
//   GROUP BY tickets.id`,
//       [id]
//     );
//     console.log("ticketResult", ticketResult.rows);
//     if (ticketResult.rows.length === 0) {
//       return res.status(404).json({ message: "Ticket not found!" });
//     }

//     const ticket = ticketResult.rows[0];

//     const replyResult = await entry_db_pool.query(
//       `SELECT
//         r.*,
//         COALESCE(
//           json_agg(
//             json_build_object(
//               'id', ta.id,
//               'filename', ta.filename,
//               'original_filename', ta.original_filename,
//               'file_type', ta.file_type,
//               'file_size', ta.file_size,
//               'file_path', ta.file_path
//             )
//           ) FILTER (WHERE ta.id IS NOT NULL),
//           '[]'::json
//         ) as attachments
//       FROM operation_ticket_reply r
//       LEFT JOIN ticket_attachments ta ON r.id = ta.reply_id
//       WHERE r.ticket_id = $1
//       GROUP BY r.id, r.reply_title, r.reply, r.ticket_id, r.replied_by, r.reply_date
//       ORDER BY r.reply_date ASC`,
//       [id]
//     );

//     const ticketAttachmentResult = await entry_db_pool.query(
//       `SELECT * FROM ticket_attachments
//        WHERE ticket_id = $1 AND reply_id IS NULL
//        ORDER BY created_at ASC`,
//       [id]
//     );

//     res.json({
//       ticket,
//       replies: replyResult.rows,
//       ticket_attachments: ticketAttachmentResult.rows,
//     });
//   } catch (error) {
//     console.error("Error fetching ticket details:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
// systemAdminRouter.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const result = await entry_db_pool.query(
//       "SELECT * FROM system_users WHERE email = $1",
//       [email]
//     );

//     const admin = result.rows[0];
//     if (!admin) {
//       return res.status(400).json({ message: "Your email is not registered" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: admin.id, username: admin.username },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "Strict",
//       maxAge: 3600 * 1000,
//     });

//     res.status(200).json({ message: "Login successful", user: admin });
//   } catch (error) {
//     res.status(500).json({ message: "Error logging in", error: error.message });
//   }
// });

// systemAdminRouter.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     const result = await entry_db_pool.query(
//       "SELECT * FROM system_users WHERE email = $1",
//       [email]
//     );

//     if (result.rows.length > 0) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await entry_db_pool.query(
//       "INSERT INTO system_users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
//       [username, email, hashedPassword]
//     );

//     const { password: _, ...userWithoutPassword } = newUser.rows[0];

//     res.status(201).json(userWithoutPassword);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error creating user", error: error.message });
//   }
// });

// systemAdminRouter.get("/verify", async (req, res) => {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await entry_db_pool.query(
//       "SELECT * FROM system_users WHERE id = $1",
//       [decoded.id]
//     );

//     if (user.rows.length === 0) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     const { password: _, ...userWithoutPassword } = user.rows[0];

//     res.status(200).json(userWithoutPassword);
//   } catch (error) {
//     res
//       .status(401)
//       .json({ message: "Invalid or expired token", error: error.message });
//   }
// });

// systemAdminRouter.get("/logout", (req, res) => {
//   res.clearCookie("token");
//   res.send({ success: true, message: "Logged out successfully." });
// });

// systemAdminRouter.get("/get-users", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;
//     const search = req.query.search || "";

//     const query = `
//       SELECT id, username, email, created_at, role, status
//       FROM system_users
//       WHERE username ILIKE $1 OR email ILIKE $1
//       ORDER BY id DESC
//       LIMIT $2 OFFSET $3
//     `;
//     const result = await entry_db_pool.query(query, [
//       `%${search}%`,
//       limit,
//       offset,
//     ]);

//     const totalResult = await entry_db_pool.query(
//       `SELECT COUNT(*) AS total FROM system_users WHERE username ILIKE $1 OR email ILIKE $1`,
//       [`%${search}%`]
//     );
//     const total = parseInt(totalResult.rows[0].total, 10);
//     const metaData = {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     };

//     res.json({ users: result.rows, metaData });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// systemAdminRouter.post("/create-user", async (req, res) => {
//   const { username, email, role } = req.body;

//   if (!username || !email || !role) {
//     return res
//       .status(400)
//       .json({ message: "Username, email, and role are required" });
//   }

//   try {
//     const existing = await entry_db_pool.query(
//       "SELECT * FROM system_users WHERE email = $1",
//       [email]
//     );
//     if (existing.rows.length > 0) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const newUser = await entry_db_pool.query(
//       "INSERT INTO system_users (username, email, role, status) VALUES ($1, $2, $3, $4) RETURNING *",
//       [username, email, role, "Inactive"]
//     );

//     if (newUser.rows.length === 0) {
//       return res.status(500).json({ message: "Error creating user" });
//     }

//     const token = jwt.sign(
//       { id: newUser.rows[0].id, email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );
//     sendMailVerification(email, token);

//     res.status(201).json(newUser.rows[0]);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error creating user", error: error.message });
//   }
// });

// systemAdminRouter.delete("/delete-user/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await entry_db_pool.query(
//       "SELECT * FROM system_users WHERE id = $1",
//       [id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "User not found!" });
//     }
//     await entry_db_pool.query("DELETE FROM system_users WHERE id = $1", [id]);
//     res.json({ message: "User deleted successfully!" });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error deleting user", error: error.message });
//   }
// });

// const sendMailVerification = (email, token) => {
//   const verificationUrl = `${process.env.VITE_SYSTEM_MODULE_URl}/verify-email/${token}`;
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "ceyinfodev@gmail.com",
//       pass: "cblf ztly ptyn zity",
//     },
//   });
//   const mailOptions = {
//     from: "ceyinfodev@gmail.com",
//     to: email,
//     subject: "Email Verification",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
//         <h2 style="color: #2563eb;">Welcome to Hotel ERP System!</h2>
//         <p style="color: #374151;">Thank you for registering. Please verify your email address to activate your account.</p>
//         <a href="${verificationUrl}" style="display: inline-block; margin: 24px 0 12px 0; padding: 12px 28px; background: #2563eb; color: #fff; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Verify Email</a>
//         <p style="color: #6b7280; font-size: 14px;">If the button above does not work, copy and paste this link into your browser:</p>
//         <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
//         <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">If you did not request this, you can safely ignore this email.</p>
//       </div>
//     `,
//     text: `Please verify your email by clicking the link: ${verificationUrl}`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error("Error sending email:", error);
//     } else {
//       console.log("Email sent:", info.response);
//     }
//   });
// };

// systemAdminRouter.post("/verify-email", async (req, res) => {
//   const { token } = req.body;
//   if (!token) {
//     return res.status(400).json({ message: "Token is required" });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     const status = await entry_db_pool.query(
//       "SELECT * FROM system_users WHERE id = $1",
//       [userId]
//     );

//     if (status.rows[0].status === "Active") {
//       return res.status(200).json({
//         message: "User already verified",
//         email: status.rows[0].email,
//         status: status.rows[0].status,
//       });
//     }

//     await entry_db_pool.query(
//       "UPDATE system_users SET status = $1 WHERE id = $2",
//       ["Active", userId]
//     );
//     const user = await entry_db_pool.query(
//       "SELECT email FROM system_users WHERE id = $1",
//       [userId]
//     );
//     res.json({
//       message: "Email verified successfully!",
//       email: user.rows[0]?.email || null,
//     });
//   } catch (error) {
//     res.status(400).json({ message: "Invalid or expired token" });
//   }
// });

// systemAdminRouter.post("/set-password", async (req, res) => {
//   const { token, password } = req.body;
//   if (!token) {
//     return res.status(400).json({ message: "Token is required" });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     const userResult = await entry_db_pool.query(
//       "SELECT password, email FROM system_users WHERE id = $1",
//       [userId]
//     );
//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const user = userResult.rows[0];
//     if (user.password !== null) {
//       return res
//         .status(400)
//         .json({ message: "Password already set for this user." });
//     }

//     let hashedPassword = null;
//     if (password) {
//       hashedPassword = await bcrypt.hash(password, 10);
//     }
//     await entry_db_pool.query(
//       "UPDATE system_users SET password = $1, status = $2 WHERE id = $3",
//       [hashedPassword, "Active", userId]
//     );
//     res.json({
//       message: "Password set successfully!",
//       email: user.email,
//     });
//   } catch (error) {
//     res.status(400).json({ message: "Invalid or expired token" });
//   }
// });

// systemAdminRouter.patch("/update-user/:id", async (req, res) => {
//   const { id } = req.params;
//   const { username, role } = req.body;
//   if (!username || !role) {
//     return res.status(400).json({ message: "Username and role are required" });
//   }
//   try {
//     const userResult = await entry_db_pool.query(
//       "SELECT * FROM system_users WHERE id = $1",
//       [id]
//     );
//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const updateResult = await entry_db_pool.query(
//       "UPDATE system_users SET username = $1, role = $2 WHERE id = $3 RETURNING *",
//       [username, role, id]
//     );
//     res.json({
//       message: "User updated successfully!",
//       user: updateResult.rows[0],
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error updating user", error: error.message });
//   }
// });

// systemAdminRouter.get("/get-organizations", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;
//     const search = req.query.search || "";

//     const query = `
//       SELECT id, name, email, label, joined_date
//       FROM organizations
//       WHERE name ILIKE $1
//       ORDER BY id DESC
//       LIMIT $2 OFFSET $3
//     `;
//     const result = await entry_db_pool.query(query, [
//       `%${search}%`,
//       limit,
//       offset,
//     ]);

//     const totalResult = await entry_db_pool.query(
//       `SELECT COUNT(*) AS total FROM organizations WHERE name ILIKE $1`,
//       [`%${search}%`]
//     );
//     const total = parseInt(totalResult.rows[0].total, 10);
//     const metaData = {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     };

//     res.json({ organizations: result.rows, metaData });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// systemAdminRouter.get("/get-organization/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await entry_db_pool.query(
//       "SELECT * FROM organizations WHERE id = $1",
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Organization not found!" });
//     }

//     const schema = result.rows[0].label;
//     console.log("schema", schema);

//     const propertyResult = await entry_db_pool.query(
//       `SELECT * FROM ${schema}.operation_property`
//     );

//     if (propertyResult.rows.length === 0) {
//       return res.status(404).json({ message: "Property not found!" });
//     }

//     const property = propertyResult.rows;
//     const org = {
//       id: result.rows[0].id,
//       name: result.rows[0].name,
//       email: result.rows[0].email,
//       label: result.rows[0].label,
//       joined_date: result.rows[0].joined_date,
//     };

//     res.json({ organization: org, property });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error fetching organization", error: error.message });
//   }
// });

// systemAdminRouter.put("/rename-organization/:id", async (req, res) => {
//   const { id } = req.params;
//   const { name } = req.body;

//   const client = await entry_db_pool.connect();

//   try {
//     await client.query("BEGIN");

//     const result = await client.query(
//       "SELECT * FROM organizations WHERE id = $1",
//       [id]
//     );

//     if (result.rows.length === 0) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Organization not found!" });
//     }

//     const org_users = await client.query(
//       "SELECT * FROM organizations_users WHERE organization_id = $1",
//       [id]
//     );

//     if (org_users.rows.length === 0) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Organization users not found!" });
//     }

//     for (const user of org_users.rows) {
//       await client.query(
//         "UPDATE organizations_users SET organization_name = $1 WHERE id = $2",
//         [name, user.id]
//       );
//     }

//     await client.query("UPDATE organizations SET name = $1 WHERE id = $2", [
//       name,
//       id,
//     ]);

//     await client.query("COMMIT");
//     res.json({ message: "Organization renamed successfully!" });
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error(error);
//     res.status(500).json({
//       message: "Error renaming organization",
//       error: error.message,
//     });
//   } finally {
//     client.release();
//   }
// });

// systemAdminRouter.get("/system-stats", async (req, res) => {
//   try {
//     const expiringSoon = await entry_db_pool.query(
//       `SELECT
//       subscription.id,
//       subscription.started_date,
//       subscription.expiry_date,
//       subscription.type as subscription_type,
//       o.name as org_name,
//       o.email as org_email,
//       o.id as org_id,
//       o.label as org_label
//       FROM subscription
//       LEFT JOIN organizations o ON subscription.org_id = o.id
//       WHERE expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
//     );

//     const expiredCount = await entry_db_pool.query(
//       `SELECT COUNT(*) FROM subscription WHERE expiry_date < CURRENT_DATE`
//     );

//     const userCount = await entry_db_pool.query(
//       `SELECT COUNT(*) FROM system_users`
//     );

//     const orgCount = await entry_db_pool.query(
//       `SELECT COUNT(*) FROM organizations`
//     );

//     const notRepliedTickets = await entry_db_pool.query(
//       `SELECT COUNT(*)
//        FROM tickets t
//        LEFT JOIN operation_ticket_reply r ON t.id = r.ticket_id
//        WHERE r.ticket_id IS NULL AND t.closed = false`
//     );

//     res.json({
//       expiringSoon: expiringSoon.rows,
//       expiredCount: Number(expiredCount.rows[0].count),
//       userCount: Number(userCount.rows[0].count),
//       orgCount: Number(orgCount.rows[0].count),
//       notRepliedTickets: Number(notRepliedTickets.rows[0].count),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// systemAdminRouter.post("/subscription-reminder", async (req, res) => {
//   try {
//     const { email, subscriptionEndDate } = req.body;

//     if (!email || !subscriptionEndDate) {
//       return res
//         .status(400)
//         .json({ message: "Email and subscription end date are required." });
//     }

//     await sendSubscriptionReminder(email, subscriptionEndDate);

//     res
//       .status(200)
//       .json({ message: "Subscription reminder sent successfully." });
//   } catch (error) {
//     console.error("Error sending subscription reminder:", error);
//     res.status(500).json({ message: "Failed to send subscription reminder." });
//   }
// });

// systemAdminRouter.get("/system-erp-settings", async (req, res) => {
//   try {
//     const settingsResult = await entry_db_pool.query(
//       `SELECT * FROM core_data.core_system_erp_settings`
//     );
//     const settings = settingsResult.rows;

//     res.status(200).json({
//       success: true,
//       settings,
//     });
//   } catch (error) {
//     console.error("Error fetching system settings:", error.message);

//     res.status(500).json({
//       success: false,
//       error: "An error occurred while fetching system settings.",
//       details: error.message,
//     });
//   }
// });

// systemAdminRouter.post("/system-erp-settings", async (req, res) => {
//   const client = await entry_db_pool.connect();
//   try {
//     const { key, id, value } = req.body;

//     if (!key || !value) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Key and value are required." });
//     }

//     await client.query("BEGIN");

//     const result = await client.query(
//       `UPDATE core_data.core_system_erp_settings SET key = $1, value = $2 WHERE id = $3 RETURNING *`,
//       [key, value, id]
//     );

//     const isUpdate = result.rowCount > 0;

//     if (!isUpdate) {
//       const existingSetting = await client.query(
//         `SELECT * FROM core_data.core_system_erp_settings WHERE key = $1`,
//         [key]
//       );
//       if (existingSetting.rows.length > 0) {
//         return res.status(400).json({
//           success: false,
//           error: "Setting with this key already exists.",
//         });
//       }

//       await client.query(
//         `INSERT INTO core_data.core_system_erp_settings (id, key, value) VALUES ($1, $2, $3)`,
//         [id, key, value]
//       );
//     }

//     const { rows: labels } = await client.query(
//       `SELECT label FROM organizations`
//     );
//     for (const { label } of labels) {
//       const { rows: propertyIds } = await client.query(
//         `SELECT id FROM ${label}.operation_property`
//       );

//       for (const { id: propertyId } of propertyIds) {
//         if (isUpdate) {
//           await client.query(
//             `UPDATE ${label}.system_erp_settings SET  value = $1 WHERE key = $2`,
//             [value, key]
//           );
//         } else {
//           await client.query(
//             `INSERT INTO ${label}.system_erp_settings ( key, value, property_id) VALUES ($1, $2, $3)`,
//             [key, value, propertyId]
//           );
//         }
//       }
//     }

//     await client.query("COMMIT");

//     res.status(200).json({
//       success: true,
//       message: "System ERP settings updated successfully.",
//     });
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error("Error updating system settings:", error);
//     res.status(500).json({
//       success: false,
//       error: "An error occurred while updating system settings.",
//       details: error.message,
//     });
//   } finally {
//     client.release();
//   }
// });

// systemAdminRouter.delete("/system-erp-settings/:key", async (req, res) => {
//   const { key } = req.params;

//   if (!key) {
//     return res.status(400).json({ message: "Key is required." });
//   }

//   try {
//     const client = await entry_db_pool.connect();
//     await client.query("BEGIN");

//     const result = await client.query(
//       `DELETE FROM core_data.core_system_erp_settings WHERE key = $1 RETURNING *`,
//       [key]
//     );

//     if (result.rowCount === 0) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Setting not found." });
//     }

//     const labelsResult = await client.query(`SELECT label FROM organizations`);
//     const labels = labelsResult.rows.map((row) => row.label);

//     for (const label of labels) {
//       const { rows } = await client.query(
//         `SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = 'system_erp_settings'`,
//         [label]
//       );

//       if (rows.length > 0) {
//         await client.query(
//           `DELETE FROM ${label}.system_erp_settings WHERE key = $1`,
//           [key]
//         );
//       }
//     }

//     await client.query("COMMIT");
//     res.status(200).json({ message: "Setting deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting setting:", error);
//     res.status(500).json({ message: "Internal server error" });
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// });

// systemAdminRouter.get("/get-organizations-list", async (req, res) => {
//   try {
//     const query = `
//       SELECT id, name
//       FROM organizations
//       ORDER BY id DESC
//     `;
//     const result = await entry_db_pool.query(query, []);

//     res.json({ success: true, organizations: result.rows });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// systemAdminRouter.get("/get-properties/:id", async (req, res) => {
//   const orgId = req.params.id;

//   // Validate that orgId is a number to avoid SQL injection via schema name
//   if (!/^\d+$/.test(orgId)) {
//     return res.status(400).json({ message: "Invalid organization ID" });
//   }

//   // Construct schema name safely
//   const schema = `org_${orgId}`;

//   try {
//     const query = `
//       SELECT id, name
//       FROM ${schema}.operation_property
//       ORDER BY id DESC
//     `;

//     const result = await entry_db_pool.query(query);

//     res.json({ success: true, properties: result.rows });
//   } catch (error) {
//     console.error("Error fetching properties:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// systemAdminRouter.get("/get-activities/:org_id/:month", async (req, res) => {
//   const org_id = req.params.org_id;
//   const month = req.params.month;

//   if (!/^\d+$/.test(org_id)) {
//     return res.status(400).json({ message: "Invalid organization ID" });
//   }

//   const schema = `org_${org_id}`;

//   const countQueries = {
//     bookings: `SELECT COUNT(*) FROM ${schema}.operation_booking WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     guest: `SELECT COUNT(*) FROM ${schema}.operation_guest WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     expenses: `SELECT COUNT(*) FROM ${schema}.operation_expenses WHERE EXTRACT(MONTH FROM expensedate) = $1`,
//     invoices: `SELECT COUNT(*) FROM ${schema}.operation_invoices WHERE EXTRACT(MONTH FROM invoicedate) = $1`,
//     transactions: `SELECT COUNT(*) FROM ${schema}.operation_transactions WHERE EXTRACT(MONTH FROM date) = $1`,
//     loans: `SELECT COUNT(*) FROM ${schema}.operation_loans WHERE EXTRACT(MONTH FROM date) = $1`,
//     investment: `SELECT COUNT(*) FROM ${schema}.operation_invest WHERE EXTRACT(MONTH FROM date) = $1`,
//     rooms: `SELECT COUNT(*) FROM ${schema}.operation_rooms WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     roomprices: `SELECT COUNT(*) FROM ${schema}.operation_roomprices WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     hoteloffers: `SELECT COUNT(*) FROM ${schema}.operation_hoteloffers WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     property: `SELECT COUNT(*) FROM ${schema}.operation_property WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     roomreclass: `SELECT COUNT(*) FROM ${schema}.operation_roomreclass WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     employee: `SELECT COUNT(*) FROM ${schema}.operation_employee WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     leave: `SELECT COUNT(*) FROM ${schema}.operation_leave WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     attendance: `SELECT COUNT(*) FROM ${schema}.operation_hr_attendance WHERE EXTRACT(MONTH FROM date) = $1`,
//     roles: `SELECT COUNT(*) FROM ${schema}.auth_roles WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     users: `SELECT COUNT(*) FROM ${schema}.auth_users WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     permissions: `SELECT COUNT(*) FROM ${schema}.auth_permission WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     menu: `SELECT COUNT(*) FROM ${schema}.operation_menu WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     sales: `SELECT COUNT(*) FROM ${schema}.operation_sales WHERE EXTRACT(MONTH FROM date) = $1`,
//     inventory: `SELECT COUNT(*) FROM ${schema}.operation_inventory WHERE EXTRACT(MONTH FROM createdate) = $1`,
//     inventory_activity: `SELECT COUNT(*) FROM ${schema}.operation_inventory_activity WHERE EXTRACT(MONTH FROM createdate) = $1`,
//   };

//   const activityQuery = `
//     SELECT id::TEXT, 'booking' AS module, 'booking created' AS action, created_by AS user, createdate AS timestamp,
//     CONCAT('Booking for ', guest_id) AS details FROM ${schema}.operation_booking
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'booking' AS module, 'guest added' AS action, created_by AS user, createdate AS timestamp,
//     'Guest added' AS details FROM ${schema}.operation_guest
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'finance' AS module, 'expense added' AS action, created_by AS user, expensedate AS timestamp,
//     CONCAT('Expense: ', notes, ' - ', grandtotal) AS details FROM ${schema}.operation_expenses
//     WHERE EXTRACT(MONTH FROM expensedate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'finance' AS module, 'invoice issued' AS action, created_by AS user, invoicedate AS timestamp,
//     CONCAT('Invoice #: ', invoiceno, ' for ', total) AS details FROM ${schema}.operation_invoices
//     WHERE EXTRACT(MONTH FROM invoicedate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'finance' AS module, 'transaction processed' AS action, created_by AS user, date AS timestamp,
//     CONCAT('Transaction: ', description, ' - ', amount) AS details FROM ${schema}.operation_transactions
//     WHERE EXTRACT(MONTH FROM date) = $1
//     UNION ALL
//     SELECT id::TEXT, 'finance' AS module, 'loan recorded' AS action, created_by AS user, date AS timestamp,
//     CONCAT('Loan entry - ', amount) AS details FROM ${schema}.operation_loans
//     WHERE EXTRACT(MONTH FROM date) = $1
//     UNION ALL
//     SELECT id::TEXT, 'finance' AS module, 'investment added' AS action, created_by AS user, date AS timestamp,
//     CONCAT('Investment: ', amount) AS details FROM ${schema}.operation_invest
//     WHERE EXTRACT(MONTH FROM date) = $1
//     UNION ALL
//     SELECT id::TEXT, 'config' AS module, 'room configured' AS action, created_by AS user, createdate AS timestamp,
//     'Room setup' AS details FROM ${schema}.operation_rooms
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'config' AS module, 'room price set' AS action, created_by AS user, createdate AS timestamp,
//     'Room price updated' AS details FROM ${schema}.operation_roomprices
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'config' AS module, 'hotel offer created' AS action, created_by AS user, createdate AS timestamp,
//     'Hotel offer created' AS details FROM ${schema}.operation_hoteloffers
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'config' AS module, 'property configured' AS action, created_by AS user, createdate AS timestamp,
//     'Property added' AS details FROM ${schema}.operation_property
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'config' AS module, 'room reclassed' AS action, created_by AS user, createdate AS timestamp,
//     'Room reclassification' AS details FROM ${schema}.operation_roomreclass
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'hr' AS module, 'employee added' AS action, created_by AS user, createdate AS timestamp,
//     'New employee' AS details FROM ${schema}.operation_employee
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'hr' AS module, 'attendance added' AS action, created_by AS user, date AS timestamp,
//     'New attendance' AS details FROM ${schema}.operation_hr_attendance
//     WHERE EXTRACT(MONTH FROM date) = $1
//     UNION ALL
//     SELECT id::TEXT, 'hr' AS module, 'leave requested' AS action, created_by AS user, createdate AS timestamp,
//     'Leave entry' AS details FROM ${schema}.operation_leave
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'user' AS module, 'role created' AS action, created_by AS user, createdate AS timestamp,
//     'Role configuration' AS details FROM ${schema}.auth_roles
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'user' AS module, 'user created' AS action, created_by AS user, createdate AS timestamp,
//     'User created' AS details FROM ${schema}.auth_users
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'user' AS module, 'permission set' AS action, created_by AS user, createdate AS timestamp,
//     'Permission configuration' AS details FROM ${schema}.auth_permission
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//         SELECT
//       id::TEXT,
//       'pos' AS module,
//       'menu configured' AS action,
//       created_by AS user,
//       createdate AS timestamp,
//       'POS menu setup' AS details
//     FROM ${schema}.operation_menu
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT
//       id::TEXT,
//       'pos' AS module,
//       'sale added' AS action,
//       created_by AS user,
//       date AS timestamp,
//       'POS sale record' AS details
//     FROM ${schema}.operation_sales
//     WHERE EXTRACT(MONTH FROM date) = $1
//     UNION ALL
//     SELECT id::TEXT, 'inventory' AS module, 'inventory entry' AS action, created_by AS user, createdate AS timestamp,
//     'Inventory added' AS details FROM ${schema}.operation_inventory
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     UNION ALL
//     SELECT id::TEXT, 'inventory' AS module, 'inventory activity logged' AS action, created_by AS user, createdate AS timestamp,
//     'Inventory activity' AS details FROM ${schema}.operation_inventory_activity
//     WHERE EXTRACT(MONTH FROM createdate) = $1
//     ORDER BY timestamp DESC;
//   `;

//   try {
//     const queryPromises = Object.entries(countQueries).map(([key, query]) =>
//       entry_db_pool
//         .query(query, [month])
//         .then((res) => [key, parseInt(res.rows[0].count, 10)])
//     );
//     const counts = Object.fromEntries(await Promise.all(queryPromises));
//     const activityRes = await entry_db_pool.query(activityQuery, [month]);

//     res.json({
//       success: true,
//       data: {
//         count: counts,
//         activities: activityRes.rows,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching full activities and counts:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

const dataTypeMapping = {
  string: "VARCHAR(255)",
  text: "TEXT",
  integer: "INTEGER",
  bigint: "BIGINT",
  decimal: "DECIMAL(10,2)",
  float: "FLOAT",
  real: "REAL",
  boolean: "BOOLEAN",
  date: "DATE",
  timestamp: "TIMESTAMP",
  timestamptz: "TIMESTAMPTZ",
  time: "TIME",
  json: "JSONB",
  uuid: "UUID",
  array: "TEXT[]",
};

// const generateConstraintName = (tableName, columnName, referencedTable) => {
//   return `fk_${tableName}_${columnName}_${referencedTable}`;
// };

// const createForeignKeySQL = (column, tableName, schema = "public") => {
//   if (!column.isForeignKey || !column.foreignKey) return "";

//   const { referencedTable, referencedColumn, onDelete, onUpdate } =
//     column.foreignKey;
//   const constraintName = generateConstraintName(
//     tableName,
//     column.name,
//     referencedTable
//   );

//   return `,
//   CONSTRAINT "${constraintName}" FOREIGN KEY ("${column.name}")
//   REFERENCES "${schema}"."${referencedTable}" ("${referencedColumn}")
//   ON DELETE ${onDelete} ON UPDATE ${onUpdate}`;
// };

// write a route for getting all schemas in the database except for the default ones

systemAdminRouter.get("/schemas", async (req, res) => {
  const schemaQuery = `
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name NOT IN ('information_schema', 'pg_catalog')
  `;
  console.log("Fetching schemas with query:", entry_db_pool);
  try {
    const result = await entry_db_pool.query(schemaQuery);
    res.json({
      success: true,
      payload: result.rows,
    });
  } catch (error) {
    console.error("Error fetching schemas:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// systemAdminRouter.post("/tables/create", async (req, res) => {
//   const { tableName, columns, schema = "public" } = req.body;

//   try {
//     if (!tableName || !columns || columns.length === 0) {
//       return res.status(400).json({
//         error: "Table name and columns are required",
//       });
//     }

//     for (const column of columns) {
//       if (column.isForeignKey) {
//         if (
//           !column.foreignKey?.referencedTable ||
//           !column.foreignKey?.referencedColumn
//         ) {
//           return res.status(400).json({
//             error: `Foreign key for column "${column.name}" requires both referenced table and column`,
//           });
//         }

//         const checkTableQuery = `
//           SELECT EXISTS (
//             SELECT FROM information_schema.tables
//             WHERE table_schema = $1 AND table_name = $2
//           )
//         `;
//         const tableExists = await entry_db_pool.query(checkTableQuery, [
//           schema,
//           column.foreignKey.referencedTable,
//         ]);

//         if (!tableExists.rows[0].exists) {
//           return res.status(400).json({
//             error: `Referenced table "${column.foreignKey.referencedTable}" does not exist in schema "${schema}"`,
//           });
//         }

//         const checkColumnQuery = `
//           SELECT EXISTS (
//             SELECT FROM information_schema.columns
//             WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
//           )
//         `;
//         const columnExists = await entry_db_pool.query(checkColumnQuery, [
//           schema,
//           column.foreignKey.referencedTable,
//           column.foreignKey.referencedColumn,
//         ]);

//         if (!columnExists.rows[0].exists) {
//           return res.status(400).json({
//             error: `Referenced column "${column.foreignKey.referencedColumn}" does not exist in table "${column.foreignKey.referencedTable}"`,
//           });
//         }
//       }
//     }

//     let query = `CREATE TABLE IF NOT EXISTS "${schema}"."${tableName}" (\n`;
//     query += "  id SERIAL PRIMARY KEY,\n";

//     columns.forEach((column, index) => {
//       const {
//         name,
//         type,
//         nullable = true,
//         defaultValue,
//         unique = false,
//       } = column;

//       if (!name || !type) {
//         throw new Error(`Column ${index + 1}: name and type are required`);
//       }

//       const pgType = dataTypeMapping[type.toLowerCase()] || type;

//       query += `  "${name}" ${pgType}`;

//       if (!nullable) query += " NOT NULL";
//       if (unique) query += " UNIQUE";
//       if (defaultValue) {
//         if (type === "string" || type === "text") {
//           query += ` DEFAULT '${defaultValue}'`;
//         } else {
//           query += ` DEFAULT ${defaultValue}`;
//         }
//       }

//       query += ",\n";
//     });

//     query += "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n";
//     query += "  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP";

//     columns.forEach((column) => {
//       if (column.isForeignKey) {
//         query += createForeignKeySQL(column, tableName, schema);
//       }
//     });

//     query += "\n);";

//     if (schema === "seed") {
//       const orgQuery = `SELECT label FROM public.organizations`;
//       const orgResult = await entry_db_pool.query(orgQuery);

//       if (orgResult.rows.length === 0) {
//         throw new Error("No organizations found");
//       }

//       for (const row of orgResult.rows) {
//         const orgLabel = row.label;
//         const fullQuery = query.replace(
//           new RegExp(`"${schema}"`, "g"),
//           `"${orgLabel}"`
//         );
//         await entry_db_pool.query(fullQuery);
//       }
//     }

//     await entry_db_pool.query(query);

//     const migrationLog = {
//       action: "CREATE_TABLE",
//       table_name: tableName,
//       schema: schema,
//       query: query,
//       executed_at: new Date(),
//     };

//     await logMigration(migrationLog);

//     res.json({
//       success: true,
//       message: `Table "${tableName}" created successfully with foreign key constraints`,
//       query: query,
//     });
//   } catch (error) {
//     console.error("Error creating table:", error);
//     res.status(500).json({
//       error: "Failed to create table",
//       details: error.message,
//     });
//   }
// });

systemAdminRouter.post("/tables/:tableName/columns", async (req, res) => {
  const { tableName } = req.params;
  const {
    name,
    type,
    nullable = true,
    defaultValue,
    unique = false,
    schema = "public",
    isForeignKey = false,
    foreignKey = {},
  } = req.body;

  const client = await entry_db_pool.connect();

  try {
    await client.query("BEGIN");

    if (!name || !type) {
      return res.status(400).json({
        error: "Column name and type are required",
      });
    }

    const checkColumnExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
      )
    `;

    const columnExistsResult = await client.query(checkColumnExistsQuery, [
      schema,
      tableName,
      name,
    ]);

    if (columnExistsResult.rows[0].exists) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: `Column "${name}" already exists in table "${tableName}"`,
      });
    }

    const checkTableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = $2
      )
    `;

    const tableExistsResult = await client.query(checkTableExistsQuery, [
      schema,
      tableName,
    ]);

    if (!tableExistsResult.rows[0].exists) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: `Table "${tableName}" does not exist in schema "${schema}"`,
      });
    }

    if (isForeignKey) {
      const {
        referencedTable,
        referencedColumn,
        onDelete = "CASCADE",
        onUpdate = "CASCADE",
      } = foreignKey;

      if (!referencedTable || !referencedColumn) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Foreign key requires both referenced table and column",
        });
      }

      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 AND table_name = $2
        )
      `;
      const tableExists = await client.query(checkTableQuery, [
        schema,
        referencedTable,
      ]);

      if (!tableExists.rows[0].exists) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Referenced table "${referencedTable}" does not exist in schema "${schema}"`,
        });
      }

      const checkColumnQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
        )
      `;
      const columnExists = await client.query(checkColumnQuery, [
        schema,
        referencedTable,
        referencedColumn,
      ]);

      if (!columnExists.rows[0].exists) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Referenced column "${referencedColumn}" does not exist in table "${referencedTable}"`,
        });
      }

      const getColumnDataTypeQuery = `
        SELECT data_type, numeric_precision, numeric_scale, character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
      `;

      const referencedColumnInfo = await client.query(getColumnDataTypeQuery, [
        schema,
        referencedTable,
        referencedColumn,
      ]);

      if (referencedColumnInfo.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Could not retrieve data type information for referenced column "${referencedColumn}"`,
        });
      }

      const referencedDataType = referencedColumnInfo.rows[0].data_type;
      const newColumnPgType = dataTypeMapping[type.toLowerCase()] || type;

      const isCompatible = await validateDataTypeCompatibility(
        newColumnPgType,
        referencedDataType,
        client
      );

      if (!isCompatible.compatible) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Foreign key data type mismatch: Column "${name}" (${newColumnPgType}) is incompatible with referenced column "${referencedColumn}" (${referencedDataType}). ${isCompatible.suggestion}`,
          details: {
            columnType: newColumnPgType,
            referencedColumnType: referencedDataType,
            suggestion: isCompatible.suggestion,
          },
        });
      }
    }

    const pgType = dataTypeMapping[type.toLowerCase()] || type;

    let baseQuery = `ALTER TABLE "{SCHEMA}"."{TABLE}" ADD COLUMN "${name}" ${pgType}`;

    if (!nullable) baseQuery += " NOT NULL";
    if (unique) baseQuery += " UNIQUE";
    if (defaultValue) {
      if (type === "string" || type === "text") {
        baseQuery += ` DEFAULT '${defaultValue}'`;
      } else {
        baseQuery += ` DEFAULT ${defaultValue}`;
      }
    }

    if (schema === "seed") {
      const orgQuery = `SELECT label FROM public.organizations`;
      const orgResult = await client.query(orgQuery);

      if (orgResult.rows.length === 0) {
        await client.query("ROLLBACK");
        throw new Error("No organizations found");
      }

      for (const row of orgResult.rows) {
        const orgLabel = row.label;

        const orgColumnExistsResult = await client.query(
          checkColumnExistsQuery,
          [orgLabel, tableName, name]
        );

        if (orgColumnExistsResult.rows[0].exists) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error: `Column "${name}" already exists in table "${tableName}" in organization schema "${orgLabel}"`,
          });
        }

        const orgTableExistsResult = await client.query(checkTableExistsQuery, [
          orgLabel,
          tableName,
        ]);

        if (!orgTableExistsResult.rows[0].exists) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error: `Table "${tableName}" does not exist in organization schema "${orgLabel}"`,
          });
        }

        if (isForeignKey) {
          const { referencedTable, referencedColumn } = foreignKey;

          const checkOrgTableQuery = `
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = $1 AND table_name = $2
            )
          `;
          const orgTableExists = await client.query(checkOrgTableQuery, [
            orgLabel,
            referencedTable,
          ]);

          if (!orgTableExists.rows[0].exists) {
            await client.query("ROLLBACK");
            return res.status(400).json({
              error: `Referenced table "${referencedTable}" does not exist in organization schema "${orgLabel}"`,
            });
          }

          const checkOrgColumnQuery = `
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
            )
          `;
          const orgColumnExists = await client.query(checkOrgColumnQuery, [
            orgLabel,
            referencedTable,
            referencedColumn,
          ]);

          if (!orgColumnExists.rows[0].exists) {
            await client.query("ROLLBACK");
            return res.status(400).json({
              error: `Referenced column "${referencedColumn}" does not exist in table "${referencedTable}" in organization schema "${orgLabel}"`,
            });
          }
        }
      }

      for (const row of orgResult.rows) {
        const orgLabel = row.label;
        const query = baseQuery
          .replace("{SCHEMA}", orgLabel)
          .replace("{TABLE}", tableName);

        await client.query(query);

        if (isForeignKey) {
          const {
            referencedTable,
            referencedColumn,
            onDelete = "CASCADE",
            onUpdate = "CASCADE",
          } = foreignKey;
          const constraintName = generateConstraintName(
            tableName,
            name,
            referencedTable
          );

          const fkQuery = `
            ALTER TABLE "${orgLabel}"."${tableName}" 
            ADD CONSTRAINT "${constraintName}" 
            FOREIGN KEY ("${name}") 
            REFERENCES "${orgLabel}"."${referencedTable}" ("${referencedColumn}") 
            ON DELETE ${onDelete} ON UPDATE ${onUpdate}
          `;

          await client.query(fkQuery);
        }
      }
    } else {
      const query = baseQuery
        .replace("{SCHEMA}", schema)
        .replace("{TABLE}", tableName);

      await client.query(query);

      if (isForeignKey) {
        const {
          referencedTable,
          referencedColumn,
          onDelete = "CASCADE",
          onUpdate = "CASCADE",
        } = foreignKey;
        const constraintName = generateConstraintName(
          tableName,
          name,
          referencedTable
        );

        const fkQuery = `
          ALTER TABLE "${schema}"."${tableName}" 
          ADD CONSTRAINT "${constraintName}" 
          FOREIGN KEY ("${name}") 
          REFERENCES "${schema}"."${referencedTable}" ("${referencedColumn}") 
          ON DELETE ${onDelete} ON UPDATE ${onUpdate}
        `;

        await client.query(fkQuery);

        const fkMigrationLog = {
          action: "ADD_FOREIGN_KEY",
          table_name: tableName,
          schema: schema,
          column_name: name,
          query: fkQuery,
          executed_at: new Date(),
        };

        await logMigration(fkMigrationLog);
      }
    }

    const migrationLog = {
      action: "ADD_COLUMN",
      table_name: tableName,
      schema: schema,
      column_name: name,
      query: baseQuery,
      executed_at: new Date(),
    };

    await logMigration(migrationLog);

    await client.query("COMMIT");

    res.json({
      success: true,
      message: `Column "${name}" added to table "${tableName}"${
        isForeignKey ? " with foreign key constraint" : ""
      }${schema === "seed" ? " across all organization schemas" : ""}`,
      query: baseQuery,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding column:", error);

    if (error.code === "42804") {
      return res.status(400).json({
        error: "Foreign key data type mismatch",
        details:
          error.detail ||
          "The column data type is incompatible with the referenced column data type",
        suggestion:
          "Ensure both columns have compatible data types (e.g., both integer, both text, etc.)",
      });
    }

    res.status(500).json({
      error: "Failed to add column",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

async function validateDataTypeCompatibility(
  newColumnType,
  referencedColumnType,
  client
) {
  const normalizeType = (type) => {
    const typeMap = {
      "character varying": "varchar",
      character: "char",
      "timestamp without time zone": "timestamp",
      "timestamp with time zone": "timestamptz",
      "double precision": "float8",
      real: "float4",
      smallint: "int2",
      integer: "int4",
      bigint: "int8",
      numeric: "decimal",
      boolean: "bool",
    };

    const normalized = type.toLowerCase().trim();
    return typeMap[normalized] || normalized;
  };

  const newType = normalizeType(newColumnType);
  const refType = normalizeType(referencedColumnType);

  const compatibilityGroups = [
    ["int2", "int4", "int8", "smallint", "integer", "bigint"],
    ["numeric", "decimal", "float4", "float8", "real", "double precision"],
    ["text", "varchar", "char", "character varying", "character"],
    ["date", "timestamp", "timestamptz", "time", "timetz"],
    ["boolean", "bool"],
    ["uuid"],
    ["json", "jsonb"],
  ];

  for (const group of compatibilityGroups) {
    if (group.includes(newType) && group.includes(refType)) {
      if (
        group.includes("int2") ||
        group.includes("int4") ||
        group.includes("int8")
      ) {
        const intSizes = {
          int2: 2,
          smallint: 2,
          int4: 4,
          integer: 4,
          int8: 8,
          bigint: 8,
        };
        const newSize = intSizes[newType] || 4;
        const refSize = intSizes[refType] || 4;

        if (newSize > refSize) {
          return {
            compatible: true,
            warning: `Column type ${newColumnType} is larger than referenced column type ${referencedColumnType}. This is allowed but may waste space.`,
          };
        }
      }

      return { compatible: true };
    }
  }

  if (newType === refType) {
    return { compatible: true };
  }

  let suggestion =
    "Change the column data type to match the referenced column.";

  if (
    ["int2", "int4", "int8", "smallint", "integer", "bigint"].includes(refType)
  ) {
    suggestion = `Use an integer type like 'integer' or 'bigint' to match the referenced column.`;
  } else if (["text", "varchar", "char"].includes(refType)) {
    suggestion = `Use a text type like 'string' or 'text' to match the referenced column.`;
  } else if (["numeric", "decimal", "float4", "float8"].includes(refType)) {
    suggestion = `Use a numeric type like 'decimal' or 'float' to match the referenced column.`;
  }

  return {
    compatible: false,
    suggestion: suggestion,
  };
}

systemAdminRouter.post(
  "/tables/:tableName/columns/validate",
  async (req, res) => {
    const { tableName } = req.params;
    const {
      name,
      type,
      nullable = true,
      defaultValue,
      unique = false,
      schema = "public",
      isForeignKey = false,
      foreignKey = {},
    } = req.body;

    try {
      if (!name || !type) {
        return res.status(400).json({
          error: "Column name and type are required for validation",
        });
      }

      const validationResults = [];
      let canAdd = 0;
      let willSkip = 0;
      let total = 0;

      const columnInfo = {
        name,
        type,
        nullable,
        unique,
        defaultValue,
        isForeignKey,
        foreignKey: isForeignKey ? foreignKey : null,
      };

      let foreignKeyValidation = null;
      if (
        isForeignKey &&
        foreignKey.referencedTable &&
        foreignKey.referencedColumn
      ) {
        foreignKeyValidation = {
          referencedTable: foreignKey.referencedTable,
          referencedColumn: foreignKey.referencedColumn,
          isValid: false,
          error: null,
          dataTypeCompatible: false,
          dataTypeDetails: null,
        };

        const checkRefTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 AND table_name = $2
        )
      `;
        const refTableExists = await entry_db_pool.query(checkRefTableQuery, [
          schema,
          foreignKey.referencedTable,
        ]);

        if (!refTableExists.rows[0].exists) {
          foreignKeyValidation.error = `Referenced table "${foreignKey.referencedTable}" does not exist in schema "${schema}"`;
        } else {
          const checkRefColumnQuery = `
          SELECT data_type, numeric_precision, numeric_scale 
          FROM information_schema.columns 
          WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
        `;
          const refColumnResult = await entry_db_pool.query(
            checkRefColumnQuery,
            [schema, foreignKey.referencedTable, foreignKey.referencedColumn]
          );

          if (refColumnResult.rows.length === 0) {
            foreignKeyValidation.error = `Referenced column "${foreignKey.referencedColumn}" does not exist in table "${foreignKey.referencedTable}"`;
          } else {
            const referencedDataType = refColumnResult.rows[0].data_type;
            const newColumnPgType = dataTypeMapping[type.toLowerCase()] || type;

            const compatibility = await validateDataTypeCompatibility(
              newColumnPgType,
              referencedDataType,
              entry_db_pool
            );

            foreignKeyValidation.dataTypeCompatible = compatibility.compatible;
            foreignKeyValidation.dataTypeDetails = {
              newColumnType: newColumnPgType,
              referencedColumnType: referencedDataType,
              compatible: compatibility.compatible,
              suggestion: compatibility.suggestion,
              warning: compatibility.warning,
            };

            if (!compatibility.compatible) {
              foreignKeyValidation.error = `Data type mismatch: ${newColumnPgType} is incompatible with ${referencedDataType}. ${compatibility.suggestion}`;
            } else {
              foreignKeyValidation.isValid = true;
            }
          }
        }
      }
      //
      if (schema === "seed") {
        const orgQuery = `SELECT label FROM public.organizations`;
        const orgResult = await entry_db_pool.query(orgQuery);

        for (const row of orgResult.rows) {
          const orgLabel = row.label;
          total++;

          const tableExistsQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = $2
          )
        `;
          const tableExistsResult = await entry_db_pool.query(
            tableExistsQuery,
            [orgLabel, tableName]
          );

          if (!tableExistsResult.rows[0].exists) {
            validationResults.push({
              schema: orgLabel,
              table: tableName,
              canAdd: false,
              tableExists: false,
              columnExists: false,
              foreignKeyError: null,
            });
            willSkip++;
            continue;
          }

          const columnExistsQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
          )
        `;
          const columnExistsResult = await entry_db_pool.query(
            columnExistsQuery,
            [orgLabel, tableName, name]
          );

          if (columnExistsResult.rows[0].exists) {
            validationResults.push({
              schema: orgLabel,
              table: tableName,
              canAdd: false,
              tableExists: true,
              columnExists: true,
              foreignKeyError: null,
            });
            willSkip++;
            continue;
          }

          let orgFKError = null;
          if (isForeignKey && !foreignKeyValidation?.isValid) {
            orgFKError =
              foreignKeyValidation?.error || "Foreign key validation failed";
          }

          if (orgFKError) {
            validationResults.push({
              schema: orgLabel,
              table: tableName,
              canAdd: false,
              tableExists: true,
              columnExists: false,
              foreignKeyError: orgFKError,
            });
            willSkip++;
          } else {
            validationResults.push({
              schema: orgLabel,
              table: tableName,
              canAdd: true,
              tableExists: true,
              columnExists: false,
              foreignKeyError: null,
            });
            canAdd++;
          }
        }
      } else {
        total = 1;

        const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 AND table_name = $2
        )
      `;
        const tableExistsResult = await entry_db_pool.query(tableExistsQuery, [
          schema,
          tableName,
        ]);

        if (!tableExistsResult.rows[0].exists) {
          validationResults.push({
            schema: schema,
            table: tableName,
            canAdd: false,
            tableExists: false,
            columnExists: false,
            foreignKeyError: null,
          });
          willSkip = 1;
        } else {
          const columnExistsQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
          )
        `;
          const columnExistsResult = await entry_db_pool.query(
            columnExistsQuery,
            [schema, tableName, name]
          );

          if (columnExistsResult.rows[0].exists) {
            validationResults.push({
              schema: schema,
              table: tableName,
              canAdd: false,
              tableExists: true,
              columnExists: true,
              foreignKeyError: null,
            });
            willSkip = 1;
          } else {
            let fkError = null;
            if (isForeignKey && !foreignKeyValidation?.isValid) {
              fkError =
                foreignKeyValidation?.error || "Foreign key validation failed";
            }

            if (fkError) {
              validationResults.push({
                schema: schema,
                table: tableName,
                canAdd: false,
                tableExists: true,
                columnExists: false,
                foreignKeyError: fkError,
              });
              willSkip = 1;
            } else {
              validationResults.push({
                schema: schema,
                table: tableName,
                canAdd: true,
                tableExists: true,
                columnExists: false,
                foreignKeyError: null,
              });
              canAdd = 1;
            }
          }
        }
      }

      res.json({
        success: true,
        summary: {
          canAdd,
          willSkip,
          total,
        },
        columnInfo,
        validationResults,
        foreignKeyValidation,
      });
    } catch (error) {
      console.error("Error validating column addition:", error);
      res.status(500).json({
        error: "Failed to validate column addition",
        details: error.message,
      });
    }
  }
);

systemAdminRouter.get("/tables/:tableName/relationships", async (req, res) => {
  const { tableName } = req.params;
  const { schema = "public" } = req.query;

  try {
    const query = `
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule,
        rc.update_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
        AND tc.table_schema = rc.constraint_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2
    `;

    const result = await entry_db_pool.query(query, [schema, tableName]);

    res.json({
      success: true,
      relationships: result.rows,
    });
  } catch (error) {
    console.error("Error fetching table relationships:", error);
    res.status(500).json({
      error: "Failed to fetch table relationships",
      details: error.message,
    });
  }
});

systemAdminRouter.delete(
  "/tables/:tableName/foreign-keys/:constraintName",
  async (req, res) => {
    const { tableName, constraintName } = req.params;
    const { schema = "public" } = req.query;

    try {
      const query = `ALTER TABLE "${schema}"."${tableName}" DROP CONSTRAINT "${constraintName}"`;

      if (schema === "seed") {
        const orgQuery = `SELECT label FROM public.organizations`;
        const orgResult = await entry_db_pool.query(orgQuery);

        for (const row of orgResult.rows) {
          const orgLabel = row.label;
          const orgQuery = `ALTER TABLE "${orgLabel}"."${tableName}" DROP CONSTRAINT "${constraintName}"`;
          await entry_db_pool.query(orgQuery);
        }
      }

      await entry_db_pool.query(query);

      const migrationLog = {
        action: "DROP_FOREIGN_KEY",
        table_name: tableName,
        schema: schema,
        query: query,
        executed_at: new Date(),
      };

      await logMigration(migrationLog);

      res.json({
        success: true,
        message: `Foreign key constraint "${constraintName}" dropped from table "${tableName}"`,
        query: query,
      });
    } catch (error) {
      console.error("Error dropping foreign key:", error);
      res.status(500).json({
        error: "Failed to drop foreign key constraint",
        details: error.message,
      });
    }
  }
);

// systemAdminRouter.put(
//   "/tables/:tableName/columns/:columnName/rename",
//   async (req, res) => {
//     const { tableName, columnName } = req.params;
//     const { newName, schema = "public" } = req.body;

//     try {
//       let baseQuery = `ALTER TABLE "{SCHEMA}"."{TABLE}" RENAME COLUMN "${columnName}" TO "${newName}"`;

//       if (schema === "seed") {
//         const orgQuery = `SELECT label FROM public.organizations`;
//         const orgResult = await entry_db_pool.query(orgQuery);

//         if (orgResult.rows.length === 0) {
//           throw new Error("No organizations found");
//         }

//         for (const row of orgResult.rows) {
//           const orgLabel = row.label;
//           const query = baseQuery
//             .replace("{SCHEMA}", orgLabel)
//             .replace("{TABLE}", tableName);

//           await entry_db_pool.query(query);
//         }
//       }
//       const query = baseQuery
//         .replace("{SCHEMA}", schema)
//         .replace("{TABLE}", tableName);

//       await entry_db_pool.query(query);

//       const migrationLog = {
//         action: "RENAME_COLUMN",
//         table_name: tableName,
//         schema: schema,
//         column_name: `${columnName} -> ${newName}`,
//         query: baseQuery,
//         executed_at: new Date(),
//       };

//       await logMigration(migrationLog);

//       res.json({
//         success: true,
//         message: `Column "${columnName}" renamed to "${newName}"`,
//         query: baseQuery,
//       });
//     } catch (error) {
//       res.status(500).json({
//         error: "Failed to rename column",
//         details: error.message,
//       });
//     }
//   }
// );
systemAdminRouter.put(
  "/tables/:tableName/columns/:columnName/rename",
  async (req, res) => {
    const { tableName, columnName } = req.params;
    const { newName, schema = "public" } = req.body;

    try {
      let baseQuery = `ALTER TABLE "{SCHEMA}"."{TABLE}" RENAME COLUMN "${columnName}" TO "${newName}"`;
      let successfulRenames = [];
      let skippedTables = [];
      let errors = [];

      if (schema === "seed") {
        const orgQuery = `SELECT label FROM public.organizations`;
        const orgResult = await entry_db_pool.query(orgQuery);

        if (orgResult.rows.length === 0) {
          throw new Error("No organizations found");
        }

        for (const row of orgResult.rows) {
          const orgLabel = row.label;

          try {
            const tableExistsQuery = `
              SELECT table_name 
              FROM information_schema.tables 
              WHERE table_schema = $1 AND table_name = $2
            `;
            const tableExists = await entry_db_pool.query(tableExistsQuery, [
              orgLabel,
              tableName,
            ]);

            if (tableExists.rows.length === 0) {
              skippedTables.push({
                schema: orgLabel,
                table: tableName,
                reason: "Table does not exist",
              });
              continue;
            }

            const columnExistsQuery = `
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
            `;
            const columnExists = await entry_db_pool.query(columnExistsQuery, [
              orgLabel,
              tableName,
              columnName,
            ]);

            if (columnExists.rows.length === 0) {
              skippedTables.push({
                schema: orgLabel,
                table: tableName,
                reason: `Column "${columnName}" does not exist`,
              });
              continue;
            }

            const newColumnExistsQuery = `
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
            `;
            const newColumnExists = await entry_db_pool.query(
              newColumnExistsQuery,
              [orgLabel, tableName, newName]
            );

            if (newColumnExists.rows.length > 0) {
              skippedTables.push({
                schema: orgLabel,
                table: tableName,
                reason: `Column "${newName}" already exists`,
              });
              continue;
            }

            const query = baseQuery
              .replace("{SCHEMA}", orgLabel)
              .replace("{TABLE}", tableName);

            await entry_db_pool.query(query);

            successfulRenames.push({
              schema: orgLabel,
              table: tableName,
              from: columnName,
              to: newName,
            });
          } catch (orgError) {
            console.error(
              `Error renaming column in ${orgLabel}.${tableName}:`,
              orgError
            );
            errors.push({
              schema: orgLabel,
              table: tableName,
              error: orgError.message,
            });
          }
        }
      }

      try {
        const tableExistsQuery = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 AND table_name = $2
        `;
        const tableExists = await entry_db_pool.query(tableExistsQuery, [
          schema,
          tableName,
        ]);

        if (tableExists.rows.length === 0) {
          skippedTables.push({
            schema: schema,
            table: tableName,
            reason: "Table does not exist",
          });
        } else {
          const columnExistsQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
          `;
          const columnExists = await entry_db_pool.query(columnExistsQuery, [
            schema,
            tableName,
            columnName,
          ]);

          if (columnExists.rows.length === 0) {
            skippedTables.push({
              schema: schema,
              table: tableName,
              reason: `Column "${columnName}" does not exist`,
            });
          } else {
            const newColumnExistsQuery = `
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
            `;
            const newColumnExists = await entry_db_pool.query(
              newColumnExistsQuery,
              [schema, tableName, newName]
            );

            if (newColumnExists.rows.length > 0) {
              skippedTables.push({
                schema: schema,
                table: tableName,
                reason: `Column "${newName}" already exists`,
              });
            } else {
              const query = baseQuery
                .replace("{SCHEMA}", schema)
                .replace("{TABLE}", tableName);

              await entry_db_pool.query(query);

              successfulRenames.push({
                schema: schema,
                table: tableName,
                from: columnName,
                to: newName,
              });
            }
          }
        }
      } catch (mainSchemaError) {
        console.error(
          `Error renaming column in ${schema}.${tableName}:`,
          mainSchemaError
        );
        errors.push({
          schema: schema,
          table: tableName,
          error: mainSchemaError.message,
        });
      }

      if (successfulRenames.length > 0) {
        const migrationLog = {
          action: "RENAME_COLUMN",
          table_name: tableName,
          schema: schema,
          column_name: `${columnName} -> ${newName}`,
          query: baseQuery,
          executed_at: new Date(),
          successful_renames: successfulRenames,
          skipped_tables: skippedTables,
          errors: errors,
        };

        await logMigration(migrationLog);
      }

      const response = {
        success: true,
        message: `Column rename operation completed`,
        summary: {
          successful: successfulRenames.length,
          skipped: skippedTables.length,
          errors: errors.length,
        },
        details: {
          successfulRenames,
          skippedTables,
          errors,
        },
        query: baseQuery,
      };

      if (
        successfulRenames.length === 0 &&
        (skippedTables.length > 0 || errors.length > 0)
      ) {
        response.success = false;
        response.message = "No columns were renamed successfully";
        return res.status(400).json(response);
      }

      res.json(response);
    } catch (error) {
      console.error("Error in column rename operation:", error);
      res.status(500).json({
        success: false,
        error: "Failed to rename column",
        details: error.message,
      });
    }
  }
);

systemAdminRouter.post(
  "/tables/:tableName/columns/:columnName/validate-rename",
  async (req, res) => {
    const { tableName, columnName } = req.params;
    const { newName, schema = "public" } = req.body;

    try {
      let validationResults = [];

      if (schema === "seed") {
        const orgQuery = `SELECT label FROM public.organizations`;
        const orgResult = await entry_db_pool.query(orgQuery);

        for (const row of orgResult.rows) {
          const orgLabel = row.label;

          const tableExistsQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = $2
          `;
          const tableExists = await entry_db_pool.query(tableExistsQuery, [
            orgLabel,
            tableName,
          ]);

          const columnExistsQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
          `;
          const columnExists = await entry_db_pool.query(columnExistsQuery, [
            orgLabel,
            tableName,
            columnName,
          ]);

          const newColumnExistsQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
          `;
          const newColumnExists = await entry_db_pool.query(
            newColumnExistsQuery,
            [orgLabel, tableName, newName]
          );

          validationResults.push({
            schema: orgLabel,
            table: tableName,
            tableExists: tableExists.rows.length > 0,
            columnExists: columnExists.rows.length > 0,
            newColumnConflict: newColumnExists.rows.length > 0,
            canRename:
              tableExists.rows.length > 0 &&
              columnExists.rows.length > 0 &&
              newColumnExists.rows.length === 0,
          });
        }
      }

      const tableExistsQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = $2
      `;
      const tableExists = await entry_db_pool.query(tableExistsQuery, [
        schema,
        tableName,
      ]);

      const columnExistsQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
      `;
      const columnExists = await entry_db_pool.query(columnExistsQuery, [
        schema,
        tableName,
        columnName,
      ]);

      const newColumnExistsQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
      `;
      const newColumnExists = await entry_db_pool.query(newColumnExistsQuery, [
        schema,
        tableName,
        newName,
      ]);

      validationResults.push({
        schema: schema,
        table: tableName,
        tableExists: tableExists.rows.length > 0,
        columnExists: columnExists.rows.length > 0,
        newColumnConflict: newColumnExists.rows.length > 0,
        canRename:
          tableExists.rows.length > 0 &&
          columnExists.rows.length > 0 &&
          newColumnExists.rows.length === 0,
      });

      const summary = {
        total: validationResults.length,
        canRename: validationResults.filter((r) => r.canRename).length,
        willSkip: validationResults.filter((r) => !r.canRename).length,
      };

      res.json({
        success: true,
        summary,
        validationResults,
      });
    } catch (error) {
      console.error("Error validating column rename:", error);
      res.status(500).json({
        success: false,
        error: "Failed to validate column rename",
        details: error.message,
      });
    }
  }
);
systemAdminRouter.delete(
  "/tables/:tableName/columns/:columnName",
  async (req, res) => {
    const { tableName, columnName } = req.params;
    const { schema = "public" } = req.query;

    try {
      let baseQuery = `ALTER TABLE "{SCHEMA}"."{TABLE}" DROP COLUMN "${columnName}"`;

      if (schema === "seed") {
        const orgQuery = `SELECT label FROM public.organizations`;
        const orgResult = await entry_db_pool.query(orgQuery);

        if (orgResult.rows.length === 0) {
          throw new Error("No organizations found");
        }

        for (const row of orgResult.rows) {
          const orgLabel = row.label;
          const query = baseQuery
            .replace("{SCHEMA}", orgLabel)
            .replace("{TABLE}", tableName);

          await entry_db_pool.query(query);
        }
      }

      const query = baseQuery
        .replace("{SCHEMA}", schema)
        .replace("{TABLE}", tableName);

      await entry_db_pool.query(query);

      const migrationLog = {
        action: "DELETE_COLUMN",
        table_name: tableName,
        schema: schema,
        column_name: columnName,
        query: baseQuery,
        executed_at: new Date(),
      };

      await logMigration(migrationLog);

      res.json({
        success: true,
        message: `Column "${columnName}" deleted from table "${tableName}"`,
        query: baseQuery,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to delete column",
        details: error.message,
      });
    }
  }
);
systemAdminRouter.get("/tables", async (req, res) => {
  const { schema = "public" } = req.query;

  try {
    const result = await entry_db_pool.query(
      `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1 
      AND table_type = 'BASE TABLE'
    `,
      [schema]
    );

    res.json({ tables: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tables" });
  }
});

systemAdminRouter.get("/tables/:tableName/structure", async (req, res) => {
  const { tableName } = req.params;
  const { schema = "public" } = req.query;

  try {
    const result = await entry_db_pool.query(
      `
      SELECT 
        a.attname as column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
        CASE WHEN a.attnotnull THEN 'NO' ELSE 'YES' END as is_nullable,
        pg_get_expr(ad.adbin, ad.adrelid) as column_default
      FROM pg_attribute a
      JOIN pg_class c ON a.attrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
      WHERE c.relname = $1 
        AND n.nspname = $2  -- Now uses schema parameter
        AND a.attnum > 0 
        AND NOT a.attisdropped
      ORDER BY a.attnum
    `,
      [tableName, schema]
    );

    res.json({ columns: result.rows });
  } catch (error) {
    console.error("Error fetching table structure:", error);
    res.status(500).json({ error: "Failed to fetch table structure" });
  }
});

// systemAdminRouter.get("/migrations", async (req, res) => {
//   try {
//     const result = await entry_db_pool.query(`
//       SELECT * FROM migration_history
//       ORDER BY executed_at DESC
//       LIMIT 50
//     `);

//     res.json({ migrations: result.rows });
//   } catch (error) {
//     console.error("Error fetching migrations:", error);
//     res.status(500).json({ error: "Failed to fetch migrations" });
//   }
// });

async function logMigration(migrationData) {
  try {
    await entry_db_pool.query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        schema_name VARCHAR(255) DEFAULT 'public',
        table_name VARCHAR(255),
        column_name VARCHAR(255),
        query TEXT NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await entry_db_pool.query(
      `
      INSERT INTO migration_history (action, schema_name, table_name, column_name, query, executed_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        migrationData.action,
        migrationData.schema || "public",
        migrationData.table_name,
        migrationData.column_name || null,
        migrationData.query,
        migrationData.executed_at,
      ]
    );
  } catch (error) {
    console.error("Error logging migration:", error);
  }
}

// systemAdminRouter.get("/organizations", async (req, res) => {
//   try {
//     const query = `
//       SELECT
//         id,
//         name,
//         label,
//         description,
//         created_at,
//         updated_at
//       FROM public.organizations
//       ORDER BY name;
//     `;

//     const result = await entry_db_pool.query(query);

//     res.json({
//       success: true,
//       organizations: result.rows,
//     });
//   } catch (error) {
//     console.error("Error fetching organizations:", error);
//     res.status(500).json({
//       error: "Failed to fetch organizations",
//       details: error.message,
//     });
//   }
// });

systemAdminRouter.get("/data/:tableName", async (req, res) => {
  const { tableName } = req.params;
  const { schema, limit = 100, offset = 0 } = req.query;

  try {
    if (!schema) {
      return res.status(400).json({
        error: "Schema parameter is required",
      });
    }

    const dataQuery = `
      SELECT * FROM "${schema}"."${tableName}"
      ORDER BY id DESC
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM "${schema}"."${tableName}";
    `;

    const [dataResult, countResult] = await Promise.all([
      entry_db_pool.query(dataQuery, [limit, offset]),
      entry_db_pool.query(countQuery),
    ]);

    res.json({
      success: true,
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({
      error: "Failed to fetch table data",
      details: error.message,
    });
  }
});

systemAdminRouter.post("/data/:tableName", async (req, res) => {
  const { tableName } = req.params;
  const { schema, data } = req.body;

  try {
    if (!schema || !data) {
      return res.status(400).json({
        error: "Schema and data are required",
      });
    }

    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position;
    `;
    const columnsResult = await entry_db_pool.query(columnsQuery, [
      schema,
      tableName,
    ]);

    if (columnsResult.rows.length === 0) {
      return res.status(404).json({
        error: `Table ${schema}.${tableName} not found`,
      });
    }

    const insertableColumns = columnsResult.rows.filter(
      (col) =>
        col.column_name !== "id" &&
        !col.column_name.includes("_at") &&
        data.hasOwnProperty(col.column_name)
    );

    if (insertableColumns.length === 0) {
      return res.status(400).json({
        error: "No valid columns provided for insertion",
      });
    }

    const columnNames = insertableColumns
      .map((col) => `"${col.column_name}"`)
      .join(", ");
    const placeholders = insertableColumns
      .map((_, index) => `$${index + 1}`)
      .join(", ");
    const values = insertableColumns.map((col) => data[col.column_name]);

    const insertQuery = `
      INSERT INTO "${schema}"."${tableName}" (${columnNames})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const result = await entry_db_pool.query(insertQuery, values);

    const migrationLog = {
      action: "INSERT_DATA",
      table_name: tableName,
      schema: schema,
      query: insertQuery,
      executed_at: new Date(),
    };

    await logMigration(migrationLog);

    res.json({
      success: true,
      message: "Data inserted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({
      error: "Failed to insert data",
      details: error.message,
    });
  }
});

systemAdminRouter.post("/data/:tableName/bulk", async (req, res) => {
  const { tableName } = req.params;
  const { schema, jsonData, format } = req.body;

  try {
    if (!schema) {
      return res.status(400).json({
        error: "Schema is required",
      });
    }

    let dataToInsert = [];

    if (format === "json" && jsonData) {
      dataToInsert = Array.isArray(jsonData) ? jsonData : [jsonData];
    }

    if (dataToInsert.length === 0) {
      return res.status(400).json({
        error: "No data provided for insertion",
      });
    }

    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position;
    `;
    const columnsResult = await entry_db_pool.query(columnsQuery, [
      schema,
      tableName,
    ]);

    if (columnsResult.rows.length === 0) {
      return res.status(404).json({
        error: `Table ${schema}.${tableName} not found`,
      });
    }

    const client = await entry_db_pool.connect();
    let insertedCount = 0;
    let errors = [];

    try {
      await client.query("BEGIN");

      for (const [index, record] of dataToInsert.entries()) {
        try {
          const insertableColumns = columnsResult.rows.filter(
            (col) =>
              col.column_name !== "id" &&
              !col.column_name.includes("_at") &&
              record.hasOwnProperty(col.column_name)
          );

          if (insertableColumns.length === 0) {
            errors.push(`Row ${index + 1}: No valid columns found`);
            continue;
          }

          const columnNames = insertableColumns
            .map((col) => `"${col.column_name}"`)
            .join(", ");
          const placeholders = insertableColumns
            .map((_, i) => `$${i + 1}`)
            .join(", ");
          const values = insertableColumns.map(
            (col) => record[col.column_name]
          );

          const insertQuery = `
            INSERT INTO "${schema}"."${tableName}" (${columnNames})
            VALUES (${placeholders});
          `;

          await client.query(insertQuery, values);
          insertedCount++;
        } catch (rowError) {
          errors.push(`Row ${index + 1}: ${rowError.message}`);
        }
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `Bulk insert completed`,
        insertedCount,
        totalRecords: dataToInsert.length,
        errors: errors.length > 0 ? errors : null,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error bulk inserting data:", error);
    res.status(500).json({
      error: "Failed to bulk insert data",
      details: error.message,
    });
  }
});

systemAdminRouter.get("/all-tables", async (req, res) => {
  try {
    const schemas = ["public", "core_data", "seed"];
    const allTables = [];

    for (const schema of schemas) {
      try {
        const tablesQuery = `
          SELECT 
            table_schema,
            table_name,
            table_type
          FROM information_schema.tables 
          WHERE table_schema = $1 AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `;

        const tablesResult = await entry_db_pool.query(tablesQuery, [schema]);

        const tablesWithSchema = tablesResult.rows.map((table) => ({
          ...table,
          schema: schema,
          display_name: table.table_name,
        }));

        allTables.push(...tablesWithSchema);
      } catch (schemaError) {
        console.error(
          `Error fetching tables for schema ${schema}:`,
          schemaError.message
        );
      }
    }

    res.json({
      success: true,
      tables: allTables,
      total: allTables.length,
    });
  } catch (error) {
    console.error("Error fetching all tables:", error);
    res.status(500).json({
      error: "Failed to fetch tables",
      details: error.message,
    });
  }
});

systemAdminRouter.delete("/data/:tableName/:id", async (req, res) => {
  const { tableName, id } = req.params;
  const { schema } = req.query;
  console.log(
    `Deleting record with ID ${id} from table ${tableName} in schema ${schema}`
  );
  try {
    if (!schema) {
      return res.status(400).json({
        error: "Schema parameter is required",
      });
    }

    if (!id) {
      return res.status(400).json({
        error: "Record ID is required",
      });
    }

    const checkQuery = `
      SELECT * FROM "${schema}"."${tableName}" WHERE id = $1;
    `;
    const checkResult = await entry_db_pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: `Record with ID ${id} not found in ${schema}.${tableName}`,
      });
    }

    const deleteQuery = `
      DELETE FROM "${schema}"."${tableName}" 
      WHERE id = $1
      RETURNING *;
    `;

    const result = await entry_db_pool.query(deleteQuery, [id]);

    const migrationLog = {
      action: "DELETE_DATA",
      table_name: tableName,
      schema: schema,
      query: deleteQuery,
      executed_at: new Date(),
      affected_record_id: id,
    };

    await logMigration(migrationLog);

    res.json({
      success: true,
      message: "Record deleted successfully",
      deletedRecord: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({
      error: "Failed to delete record",
      details: error.message,
    });
  }
});

// systemAdminRouter.delete(
//   "/data/bulk-delete/:tableName/bulk",
//   async (req, res) => {
//     const { tableName } = req.params;
//     const { schema, ids } = req.body;
//     console.log(
//       `Bulk deleting records with IDs ${ids} from table ${tableName} in schema ${schema}`
//     );
//     try {
//       if (!schema) {
//         return res.status(400).json({
//           error: "Schema is required",
//         });
//       }

//       if (!ids || !Array.isArray(ids) || ids.length === 0) {
//         return res.status(400).json({
//           error: "Array of IDs is required",
//         });
//       }

//       const validIds = ids.filter((id) => id && !isNaN(id));
//       if (validIds.length === 0) {
//         return res.status(400).json({
//           error: "No valid IDs provided",
//         });
//       }

//       const client = await entry_db_pool.connect();
//       let deletedCount = 0;
//       let errors = [];
//       let deletedRecords = [];

//       try {
//         await client.query("BEGIN");

//         const placeholders = validIds
//           .map((_, index) => `$${index + 1}`)
//           .join(", ");
//         const checkQuery = `
//         SELECT * FROM "${schema}"."${tableName}"
//         WHERE id IN (${placeholders});
//       `;
//         const existingRecords = await client.query(checkQuery, validIds);

//         if (existingRecords.rows.length === 0) {
//           await client.query("ROLLBACK");
//           return res.status(404).json({
//             error: "No records found with the provided IDs",
//           });
//         }

//         const deleteQuery = `
//         DELETE FROM "${schema}"."${tableName}"
//         WHERE id IN (${placeholders})
//         RETURNING *;
//       `;

//         const result = await client.query(deleteQuery, validIds);
//         deletedRecords = result.rows;
//         deletedCount = result.rowCount;

//         await client.query("COMMIT");

//         const migrationLog = {
//           action: "BULK_DELETE_DATA",
//           table_name: tableName,
//           schema: schema,
//           query: deleteQuery,
//           executed_at: new Date(),
//           affected_record_ids: validIds,
//         };

//         await logMigration(migrationLog);

//         res.json({
//           success: true,
//           message: `Bulk delete completed`,
//           deletedCount,
//           totalRequested: validIds.length,
//           deletedRecords,
//           errors: errors.length > 0 ? errors : null,
//         });
//       } catch (error) {
//         await client.query("ROLLBACK");
//         throw error;
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error bulk deleting records:", error);
//       res.status(500).json({
//         error: "Failed to bulk delete records",
//         details: error.message,
//       });
//     }
//   }
// );

// const execAsync = promisify(exec);
// const deploymentStatus = new Map();
// const appConfigs = new Map();

// const APP_BASE_PATH = "/home/appadmin/herp";

// const ensurePM2Ready = async () => {
//   try {
//     await execAsync("pm2 ping");
//     return true;
//   } catch (error) {
//     console.error("PM2 is not running or accessible:", error);
//     try {
//       await execAsync("pm2 resurrect");
//       await execAsync("pm2 ping");
//       return true;
//     } catch (startError) {
//       console.error("Failed to start PM2:", startError);
//       return false;
//     }
//   }
// };

// export const initDatabaseSys = async () => {
//   try {
//     await entry_db_pool.query(`
//       CREATE TABLE IF NOT EXISTS app_configs (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255) UNIQUE NOT NULL,
//         path TEXT NOT NULL,
//         branch VARCHAR(255) NOT NULL DEFAULT 'main',
//         port INTEGER NOT NULL,
//         type VARCHAR(50) NOT NULL CHECK (type IN ('react', 'node')),
//         pm2_name VARCHAR(255) NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     await entry_db_pool.query(`
//       CREATE TABLE IF NOT EXISTS deployment_history (
//         id SERIAL PRIMARY KEY,
//         app_name VARCHAR(255) NOT NULL,
//         action VARCHAR(50) NOT NULL,
//         status VARCHAR(50) NOT NULL,
//         branch VARCHAR(255),
//         logs TEXT[],
//         start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         end_time TIMESTAMP,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     await entry_db_pool.query(
//       `CREATE INDEX IF NOT EXISTS idx_app_configs_name ON app_configs(name)`
//     );
//     await entry_db_pool.query(
//       `CREATE INDEX IF NOT EXISTS idx_deployment_history_app_name ON deployment_history(app_name)`
//     );
//     await entry_db_pool.query(
//       `CREATE INDEX IF NOT EXISTS idx_deployment_history_created_at ON deployment_history(created_at)`
//     );

//     await loadAppConfigsFromDB();

//     console.log("Database initialized successfully");
//   } catch (error) {
//     console.error("Database initialization error:", error);
//   }
// };
// export const loadAppConfigsFromDB = async () => {
//   try {
//     const result = await entry_db_pool.query(
//       "SELECT * FROM app_configs ORDER BY name"
//     );
//     appConfigs.clear();

//     result.rows.forEach((row) => {
//       appConfigs.set(row.name, {
//         name: row.name,
//         path: row.path,
//         branch: row.branch,
//         port: row.port,
//         type: row.type,
//         pm2Name: row.pm2_name,
//       });
//     });

//     console.log(
//       `Loaded ${result.rows.length} app configurations from database`
//     );
//   } catch (error) {
//     console.error("Error loading app configs from database:", error);
//   }
// };

// const saveDeploymentToDB = async (
//   appName,
//   action,
//   status,
//   branch = null,
//   logs = [],
//   startTime = null,
//   endTime = null
// ) => {
//   try {
//     await entry_db_pool.query(
//       `INSERT INTO deployment_history (app_name, action, status, branch, logs, start_time, end_time)
//        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
//       [appName, action, status, branch, logs, startTime || new Date(), endTime]
//     );
//   } catch (error) {
//     console.error("Error saving deployment to database:", error);
//   }
// };

// const executeCommand = async (command, workingDir = APP_BASE_PATH) => {
//   return new Promise((resolve, reject) => {
//     const process = spawn("bash", ["-c", command], {
//       cwd: workingDir,
//       stdio: ["pipe", "pipe", "pipe"],
//     });

//     let stdout = "";
//     let stderr = "";

//     process.stdout.on("data", (data) => {
//       stdout += data.toString();
//     });

//     process.stderr.on("data", (data) => {
//       stderr += data.toString();
//     });

//     process.on("close", (code) => {
//       if (code === 0) {
//         resolve({ stdout, stderr, code });
//       } else {
//         const errorMessage =
//           stderr.trim() ||
//           stdout.trim() ||
//           `Command "${command}" failed with exit code ${code}`;
//         const error = new Error(errorMessage);
//         error.code = code;
//         error.stdout = stdout;
//         error.stderr = stderr;
//         error.command = command;
//         reject(error);
//       }
//     });

//     process.on("error", (error) => {
//       const wrappedError = new Error(error.message || error.toString());
//       wrappedError.originalError = error;
//       reject(wrappedError);
//     });
//   });
// };

// const getPM2Status = async (pm2Name) => {
//   try {
//     const { stdout } = await execAsync(`pm2 jlist`);

//     if (!stdout.trim()) {
//       return { status: "stopped", cpu: 0, memory: 0 };
//     }

//     const processes = JSON.parse(stdout);

//     if (!Array.isArray(processes) || processes.length === 0) {
//       return { status: "stopped", cpu: 0, memory: 0 };
//     }

//     const app = processes.find((p) => p.name === pm2Name);

//     if (!app) {
//       return { status: "stopped", cpu: 0, memory: 0 };
//     }

//     return {
//       status:
//         app.pm2_env?.status === "online"
//           ? "running"
//           : app.pm2_env?.status === "stopped"
//           ? "stopped"
//           : "error",
//       cpu: app.monit?.cpu || 0,
//       memory: app.monit?.memory || 0,
//       pid: app.pid || null,
//       uptime: app.pm2_env?.pm_uptime || null,
//       restarts: app.pm2_env?.restart_time || 0,
//     };
//   } catch (error) {
//     console.error("Error getting PM2 status:", error);

//     try {
//       const { stdout: describeOutput } = await execAsync(
//         `pm2 describe ${pm2Name}`
//       );
//       if (describeOutput.includes("online")) {
//         return { status: "running", cpu: 0, memory: 0 };
//       } else if (describeOutput.includes("stopped")) {
//         return { status: "stopped", cpu: 0, memory: 0 };
//       }
//     } catch (fallbackError) {
//       console.error("Fallback PM2 status check also failed:", fallbackError);
//     }

//     return { status: "error", cpu: 0, memory: 0 };
//   }
// };

// const checkMaintenanceMode = async (appPath) => {
//   try {
//     const maintenanceFile = path.join(appPath, "maintenance.sh");
//     await fs.access(maintenanceFile);

//     const maintenanceFlagFile = path.join(appPath, ".maintenance");
//     try {
//       await fs.access(maintenanceFlagFile);
//       return true;
//     } catch {
//       return false;
//     }
//   } catch {
//     return false;
//   }
// };

// const getAvailableBranches = async (appPath) => {
//   try {
//     const { stdout } = await execAsync("git branch -r", { cwd: appPath });
//     const branches = stdout
//       .split("\n")
//       .map((branch) => branch.trim())
//       .filter((branch) => branch && !branch.includes("HEAD"))
//       .map((branch) => branch.replace("origin/", ""))
//       .filter((branch, index, arr) => arr.indexOf(branch) === index);

//     return branches;
//   } catch (error) {
//     console.error("Error getting branches:", error);
//     return [];
//   }
// };

// systemAdminRouter.get("/apps", async (req, res) => {
//   try {
//     const pm2Ready = await ensurePM2Ready();
//     if (!pm2Ready) {
//       console.warn("PM2 is not accessible, apps will show as stopped");
//     }

//     const apps = [];

//     for (const [appName, config] of appConfigs.entries()) {
//       const pm2Status = pm2Ready
//         ? await getPM2Status(config.pm2Name)
//         : { status: "error", cpu: 0, memory: 0 };
//       const isInMaintenance = await checkMaintenanceMode(config.path);
//       const availableBranches = await getAvailableBranches(config.path);

//       let lastCommit = "Unknown";
//       let gitBranch = config.branch;
//       try {
//         const { stdout: commitInfo } = await execAsync(
//           'git log -1 --format="%h - %s (%cr)"',
//           {
//             cwd: config.path,
//           }
//         );
//         lastCommit = commitInfo.trim();

//         const { stdout: branchInfo } = await execAsync(
//           "git branch --show-current",
//           {
//             cwd: config.path,
//           }
//         );
//         gitBranch = branchInfo.trim() || config.branch;
//       } catch (error) {
//         console.error(`Error getting git info for ${appName}:`, error.message);
//       }

//       apps.push({
//         name: appName,
//         status: isInMaintenance ? "maintenance" : pm2Status.status,
//         lastDeployed: new Date().toISOString(),
//         branch: gitBranch,
//         port: config.port,
//         type: config.type,
//         lastCommit,
//         cpu: pm2Status.cpu,
//         memory: pm2Status.memory,
//         pid: pm2Status.pid,
//         uptime: pm2Status.uptime,
//         restarts: pm2Status.restarts || 0,
//         pm2Name: config.pm2Name,
//         availableBranches,
//       });
//     }

//     res.json(apps);
//   } catch (error) {
//     console.error("Error fetching apps:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch applications", details: error.message });
//   }
// });

// systemAdminRouter.get("/deployments", async (req, res) => {
//   try {
//     const deployments = {};

//     for (const [appName, status] of deploymentStatus.entries()) {
//       deployments[appName] = status;
//     }

//     res.json(deployments);
//   } catch (error) {
//     console.error("Error fetching deployments:", error);
//     res.status(500).json({ error: "Failed to fetch deployment status" });
//   }
// });

// systemAdminRouter.post("/deploy/:appName", async (req, res) => {
//   const { appName } = req.params;
//   const { action, branch } = req.body;

//   const config = appConfigs.get(appName);
//   if (!config) {
//     return res.status(404).json({ error: "Application not found" });
//   }

//   const currentStatus = deploymentStatus.get(appName);
//   if (currentStatus && currentStatus.status === "running") {
//     return res.status(400).json({ error: "Deployment already in progress" });
//   }

//   const deploymentId = `${appName}-${Date.now()}`;
//   const startTime = new Date();
//   deploymentStatus.set(appName, {
//     id: deploymentId,
//     status: "running",
//     step: "Starting...",
//     logs: [],
//     startTime: startTime.toISOString(),
//     branch: branch || config.branch,
//   });

//   res.json({
//     message: `${action} started for ${appName}`,
//     deploymentId,
//   });

//   if (action === "deploy") {
//     deployApp(appName, config, branch);
//   } else if (action === "start") {
//     startApp(appName, config);
//   } else if (action === "stop") {
//     stopApp(appName, config);
//   }
// });

// systemAdminRouter.post("/global-operations", async (req, res) => {
//   const { operation } = req.body;
//   console.log(`Received global operation request: ${operation}`);
//   try {
//     switch (operation) {
//       case "stop-all":
//         for (const [appName, config] of appConfigs.entries()) {
//           try {
//             if (
//               config.name === "hotel-erp-backend-v1" ||
//               config.pm2Name === "backend-start" ||
//               config.pm2Name === "system-serve"
//             ) {
//               console.log(`Skipping backend application: ${appName}`);
//               continue;
//             }

//             await executeCommand(`pm2 stop ${config.pm2Name}`);
//             console.log(`Stopped application: ${appName} (${config.pm2Name})`);
//           } catch (error) {
//             console.error(`Error stopping ${appName}:`, error);
//           }
//         }
//         res.json({ message: "All applications stopped (except backend)" });
//         break;

//       //without backend
//       case "restart-all":
//         for (const [appName, config] of appConfigs.entries()) {
//           try {
//             if (
//               config.name === "hotel-erp-backend-v1" ||
//               config.pm2Name === "backend-start" ||
//               config.pm2Name === "system-serve"
//             ) {
//               console.log(`Skipping backend application: ${appName}`);
//               continue;
//             }

//             await executeCommand(`pm2 restart ${config.pm2Name}`);
//             console.log(
//               `Restarted application: ${appName} (${config.pm2Name})`
//             );
//           } catch (error) {
//             console.error(`Error restarting ${appName}:`, error);
//           }
//         }
//         res.json({ message: "All applications restarted (except backend)" });
//         break;
//       //super user fo maintenance enable/disable

//       case "maintenance-enable-all":
//         try {
//           await executeCommand(
//             "./maintenance.sh enable",
//             "/home/appadmin/herp"
//           );
//           console.log(`Executed global maintenance enable script`);
//           res.json({
//             message: "Maintenance mode enabled for all applications",
//           });
//         } catch (error) {
//           console.error(`Error enabling global maintenance:`, error);
//           res.status(500).json({ error: "Failed to enable maintenance mode" });
//         }

//         break;

//       case "maintenance-disable-all":
//         try {
//           await executeCommand(
//             "./maintenance.sh disable",
//             "/home/appadmin/herp"
//           );
//           console.log(`Executed global maintenance disable script`);
//           res.json({
//             message: "Maintenance mode disabled for all applications",
//           });
//         } catch (error) {
//           console.error(`Error disabling global maintenance:`, error);
//           res.status(500).json({ error: "Failed to disable maintenance mode" });
//         }
//         break;

//       default:
//         res.status(400).json({ error: "Invalid operation" });
//     }
//   } catch (error) {
//     console.error("Global operation error:", error);
//     res.status(500).json({ error: "Failed to perform global operation" });
//   }
// });

// systemAdminRouter.post("/apps", async (req, res) => {
//   const { name, path, branch, port, type, pm2Name } = req.body;

//   try {
//     const result = await entry_db_pool.query(
//       `INSERT INTO app_configs (name, path, branch, port, type, pm2_name)
//        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
//       [name, path, branch || "main", port, type, pm2Name]
//     );

//     const newConfig = {
//       name: result.rows[0].name,
//       path: result.rows[0].path,
//       branch: result.rows[0].branch,
//       port: result.rows[0].port,
//       type: result.rows[0].type,
//       pm2Name: result.rows[0].pm2_name,
//     };

//     appConfigs.set(name, newConfig);

//     res.json({ message: "Application configuration added", config: newConfig });
//   } catch (error) {
//     console.error("Error adding app configuration:", error);
//     if (error.code === "23505") {
//       res
//         .status(400)
//         .json({ error: "Application with this name already exists" });
//     } else {
//       res
//         .status(500)
//         .json({ error: "Failed to add application configuration" });
//     }
//   }
// });

// systemAdminRouter.put("/apps/:appName", async (req, res) => {
//   const { appName } = req.params;
//   const { path, branch, port, type, pm2Name } = req.body;

//   try {
//     const result = await entry_db_pool.query(
//       `UPDATE app_configs
//        SET path = $1, branch = $2, port = $3, type = $4, pm2_name = $5, updated_at = CURRENT_TIMESTAMP
//        WHERE name = $6 RETURNING *`,
//       [path, branch, port, type, pm2Name, appName]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Application not found" });
//     }

//     const updatedConfig = {
//       name: result.rows[0].name,
//       path: result.rows[0].path,
//       branch: result.rows[0].branch,
//       port: result.rows[0].port,
//       type: result.rows[0].type,
//       pm2Name: result.rows[0].pm2_name,
//     };

//     appConfigs.set(appName, updatedConfig);

//     res.json({
//       message: "Application configuration updated",
//       config: updatedConfig,
//     });
//   } catch (error) {
//     console.error("Error updating app configuration:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to update application configuration" });
//   }
// });

// systemAdminRouter.delete("/apps/:appName", async (req, res) => {
//   const { appName } = req.params;

//   try {
//     const result = await entry_db_pool.query(
//       "DELETE FROM app_configs WHERE name = $1 RETURNING *",
//       [appName]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Application not found" });
//     }

//     appConfigs.delete(appName);

//     res.json({ message: "Application configuration deleted" });
//   } catch (error) {
//     console.error("Error deleting app configuration:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to delete application configuration" });
//   }
// });

// systemAdminRouter.get("/logs/:appName", async (req, res) => {
//   const { appName } = req.params;
//   const { lines = 100 } = req.query;
//   const config = appConfigs.get(appName);

//   if (!config) {
//     return res.status(404).json({ error: "Application not found" });
//   }

//   try {
//     try {
//       const { stdout } = await execAsync(
//         `pm2 logs ${config.pm2Name} --lines ${lines} --nostream --raw`
//       );
//       res.json({
//         logs: stdout.split("\n").filter((line) => line.trim() !== ""),
//         source: "pm2",
//       });
//     } catch (pm2Error) {
//       const logPaths = [
//         path.join(config.path, "logs", "app.log"),
//         path.join(config.path, "logs", "error.log"),
//         path.join(config.path, "npm-debug.log"),
//         "/var/log/nginx/access.log",
//       ];

//       let foundLogs = false;
//       for (const logPath of logPaths) {
//         try {
//           const logContent = await fs.readFile(logPath, "utf8");
//           const logLines = logContent.split("\n").slice(-lines);
//           res.json({
//             logs: logLines.filter((line) => line.trim() !== ""),
//             source: `file:${logPath}`,
//           });
//           foundLogs = true;
//           break;
//         } catch (fileError) {
//           continue;
//         }
//       }

//       if (!foundLogs) {
//         res.json({
//           logs: [
//             `No logs available for ${appName}`,
//             `PM2 error: ${pm2Error.message}`,
//           ],
//           source: "error",
//         });
//       }
//     }
//   } catch (error) {
//     console.error("Error fetching logs:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch logs", details: error.message });
//   }
// });

// systemAdminRouter.get("/deployment-history/:appName", async (req, res) => {
//   const { appName } = req.params;
//   const { limit = 10 } = req.query;

//   try {
//     const result = await entry_db_pool.query(
//       "SELECT * FROM deployment_history WHERE app_name = $1 ORDER BY created_at DESC LIMIT $2",
//       [appName, limit]
//     );

//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error fetching deployment history:", error);
//     res.status(500).json({ error: "Failed to fetch deployment history" });
//   }
// });

// systemAdminRouter.get("/debug/pm2", async (req, res) => {
//   try {
//     const debug = {
//       pm2Available: false,
//       pm2Ping: false,
//       pm2Version: null,
//       processes: [],
//       rawOutput: {},
//       errors: [],
//     };

//     try {
//       const { stdout: version } = await execAsync("pm2 --version");
//       debug.pm2Available = true;
//       debug.pm2Version = version.trim();
//     } catch (error) {
//       debug.errors.push(`PM2 not available: ${error.message}`);
//     }

//     if (debug.pm2Available) {
//       try {
//         await execAsync("pm2 ping");
//         debug.pm2Ping = true;
//       } catch (error) {
//         debug.errors.push(`PM2 ping failed: ${error.message}`);
//       }
//     }

//     if (debug.pm2Ping) {
//       try {
//         const { stdout: jlistOutput } = await execAsync("pm2 jlist");
//         debug.rawOutput.jlist = jlistOutput;

//         if (jlistOutput.trim()) {
//           debug.processes = JSON.parse(jlistOutput);
//         }
//       } catch (error) {
//         debug.errors.push(`PM2 jlist failed: ${error.message}`);
//         debug.rawOutput.jlistError = error.message;

//         try {
//           const { stdout: listOutput } = await execAsync("pm2 list");
//           debug.rawOutput.list = listOutput;
//         } catch (listError) {
//           debug.errors.push(`PM2 list also failed: ${listError.message}`);
//         }
//       }
//     }

//     debug.configuredApps = Array.from(appConfigs.entries()).map(
//       ([name, config]) => ({
//         name,
//         pm2Name: config.pm2Name,
//         path: config.path,
//         type: config.type,
//       })
//     );

//     res.json(debug);
//   } catch (error) {
//     res.status(500).json({ error: "Debug failed", details: error.message });
//   }
// });

// systemAdminRouter.get("/logs/:appName", async (req, res) => {
//   const { appName } = req.params;
//   const config = appConfigs.get(appName);

//   if (!config) {
//     return res.status(404).json({ error: "Application not found" });
//   }

//   try {
//     const { stdout } = await execAsync(
//       `pm2 logs ${config.pm2Name} --lines 100 --nostream`
//     );
//     res.json({ logs: stdout.split("\n") });
//   } catch (error) {
//     console.error("Error fetching logs:", error);
//     res.status(500).json({ error: "Failed to fetch logs" });
//   }
// });

// systemAdminRouter.get("/deployment/:appName", async (req, res) => {
//   const { appName } = req.params;
//   const deployment = deploymentStatus.get(appName);

//   if (!deployment) {
//     return res.status(404).json({ error: "Deployment not found" });
//   }

//   res.json(deployment);
// });

// systemAdminRouter.delete("/deployment/:appName", async (req, res) => {
//   const { appName } = req.params;
//   deploymentStatus.delete(appName);
//   res.json({ message: "Deployment history cleared" });
// });

// systemAdminRouter.get("/system-info", async (req, res) => {
//   try {
//     const [cpuInfo, memInfo, diskInfo] = await Promise.all([
//       execAsync(
//         "top -bn1 | grep \"Cpu(s)\" | awk '{print $2}' | awk -F'%' '{print $1}'"
//       ),
//       execAsync("free -m | awk 'NR==2{printf \"%.2f\", $3*100/$2 }'"),
//       execAsync('df -h | awk \'$NF=="/"{printf "%s", $5}\''),
//     ]);

//     res.json({
//       cpu: parseFloat(cpuInfo.stdout.trim()) || 0,
//       memory: parseFloat(memInfo.stdout.trim()) || 0,
//       disk: diskInfo.stdout.trim() || "0%",
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error("Error fetching system info:", error);
//     res.status(500).json({ error: "Failed to fetch system information" });
//   }
// });

// systemAdminRouter.post("/apps/:appName/config", async (req, res) => {
//   const { appName } = req.params;
//   const { branch, port } = req.body;

//   const config = appConfigs.get(appName);
//   if (!config) {
//     return res.status(404).json({ error: "Application not found" });
//   }

//   if (branch) config.branch = branch;
//   if (port) config.port = port;

//   appConfigs.set(appName, config);

//   res.json({ message: "Configuration updated", config });
// });

// const executeCommand = async (command, workingDir = APP_BASE_PATH) => {
//   return new Promise((resolve, reject) => {
//     // Enhanced environment setup
//     const env = {
//       ...process.env,
//       PATH: `/usr/local/bin:/usr/bin:/bin:${process.env.PATH}`,
//       NODE_PATH: "/usr/local/lib/node_modules:/usr/lib/node_modules",
//       HOME: process.env.HOME || "/home/appadmin",
//     };

//     // Use bash with login shell to get full environment
//     const fullCommand = `source ~/.bashrc 2>/dev/null || true; ${command}`;

//     const childProcess = spawn("bash", ["-l", "-c", fullCommand], {
//       cwd: workingDir,
//       stdio: ["pipe", "pipe", "pipe"],
//       env: env,
//     });

//     let stdout = "";
//     let stderr = "";

//     childProcess.stdout.on("data", (data) => {
//       stdout += data.toString();
//     });

//     childProcess.stderr.on("data", (data) => {
//       stderr += data.toString();
//     });

//     childProcess.on("close", (code) => {
//       if (code === 0) {
//         resolve({ stdout, stderr, code });
//       } else {
//         const errorMessage =
//           stderr.trim() ||
//           stdout.trim() ||
//           `Command "${command}" failed with exit code ${code}`;
//         const error = new Error(errorMessage);
//         error.code = code;
//         error.stdout = stdout;
//         error.stderr = stderr;
//         error.command = command;
//         reject(error);
//       }
//     });

//     childProcess.on("error", (error) => {
//       const wrappedError = new Error(error.message || error.toString());
//       wrappedError.originalError = error;
//       reject(wrappedError);
//     });
//   });
// };

// const deployApp = async (appName, config, branch = null) => {
//   const deployBranch = branch || config.branch;
//   const startTime = new Date();
//   console.log(`Starting deployment for ${appName} on branch ${deployBranch}`);

//   const updateStatus = (step, logs = []) => {
//     const current = deploymentStatus.get(appName) || {};
//     deploymentStatus.set(appName, {
//       ...current,
//       step,
//       logs: [...(current.logs || []), ...logs],
//     });
//   };

//   const logError = (step, error) => {
//     const endTime = new Date();
//     deploymentStatus.set(appName, {
//       ...deploymentStatus.get(appName),
//       status: "error",
//       step,
//       logs: [
//         ...(deploymentStatus.get(appName)?.logs || []),
//         `ERROR: ${error.message}`,
//         `STDERR: ${error.stderr || ""}`,
//         `STDOUT: ${error.stdout || ""}`,
//       ],
//       endTime: endTime.toISOString(),
//     });

//     saveDeploymentToDB(
//       appName,
//       "deploy",
//       "error",
//       deployBranch,
//       deploymentStatus.get(appName)?.logs || [],
//       startTime,
//       endTime
//     );
//   };

//   try {
//     updateStatus("Pulling latest code...", [
//       "Fetching latest changes from repository",
//     ]);
//     const gitResult = await executeCommand(
//       `git pull origin ${deployBranch}`,
//       config.path
//     );
//     updateStatus("Code updated", [
//       `Git pull completed: ${gitResult.stdout.trim()}`,
//     ]);

//     // Environment verification
//     updateStatus("Verifying environment...", [
//       "Checking Node.js and npm paths",
//     ]);
//     try {
//       const nodeWhich = await executeCommand("which node", config.path);
//       const npmWhich = await executeCommand("which npm", config.path);
//       const nodeVersion = await executeCommand("node --version", config.path);
//       const npmVersion = await executeCommand("npm --version", config.path);

//       updateStatus("Environment verified", [
//         `Node.js path: ${nodeWhich.stdout.trim()}`,
//         `npm path: ${npmWhich.stdout.trim()}`,
//         `Node.js version: ${nodeVersion.stdout.trim()}`,
//         `npm version: ${npmVersion.stdout.trim()}`,
//       ]);
//     } catch (envError) {
//       updateStatus("Environment check failed", [
//         `Warning: ${envError.message}`,
//         "Continuing with deployment...",
//       ]);
//     }

//     // For React apps, handle build process
//     if (config.type === "react") {
//       // Clean and prepare environment
//       updateStatus("Preparing build environment...", [
//         "Cleaning caches and temp files",
//       ]);
//       try {
//         // Clear npm cache
//         await executeCommand("npm cache clean --force", config.path);

//         // Remove problematic temp directories
//         await executeCommand(
//           "rm -rf node_modules/.vite-temp node_modules/.vite",
//           config.path
//         );

//         updateStatus("Environment cleaned", ["Caches and temp files cleared"]);
//       } catch (cleanError) {
//         console.warn("Cache clean failed, continuing...", cleanError.message);
//       }

//       // Install dependencies with enhanced error handling
//       updateStatus("Installing dependencies...", [
//         "Running npm install with full environment",
//       ]);

//       // Always start with a clean slate for problematic builds
//       try {
//         await executeCommand(
//           "rm -rf node_modules/.vite-temp node_modules/.vite",
//           config.path
//         );
//       } catch (cleanError) {
//         console.warn(
//           "Could not clean vite temp directories:",
//           cleanError.message
//         );
//       }

//       try {
//         // Use local installation only, avoid global permissions issues
//         await executeCommand("npm install --no-global", config.path);
//         updateStatus("Dependencies installed", [
//           "npm install completed successfully",
//         ]);
//       } catch (installError) {
//         updateStatus("Primary install failed, trying alternatives...", [
//           `Error: ${installError.message}`,
//         ]);

//         try {
//           // Complete clean install without global dependencies
//           await executeCommand(
//             "rm -rf node_modules package-lock.json",
//             config.path
//           );
//           await executeCommand("npm cache clean --force", config.path);
//           await executeCommand(
//             "npm install --legacy-peer-deps --no-global",
//             config.path
//           );
//           updateStatus("Dependencies installed (clean + legacy)", [
//             "npm install completed with clean slate and legacy-peer-deps",
//           ]);
//         } catch (cleanInstallError) {
//           // Force install locally only
//           await executeCommand("npm install --force --no-global", config.path);
//           updateStatus("Dependencies installed (forced local)", [
//             "npm install completed with --force flag, local only",
//           ]);
//         }
//       }

//       // Explicitly verify and install Vite locally only
//       updateStatus("Verifying Vite installation...", [
//         "Checking if Vite is properly installed locally",
//       ]);
//       try {
//         const viteCheck = await executeCommand("npm list vite", config.path);
//         updateStatus("Vite verified", [
//           `Vite status: ${viteCheck.stdout.trim()}`,
//         ]);
//       } catch (viteError) {
//         updateStatus("Vite missing, installing locally...", [
//           "Installing Vite as local dev dependency",
//         ]);

//         // Force install Vite locally only - avoid global permission issues
//         try {
//           await executeCommand(
//             "npm install vite@latest --save-dev --force --no-global",
//             config.path
//           );
//           await executeCommand(
//             "npm install @vitejs/plugin-react@latest --save-dev --force --no-global",
//             config.path
//           );
//           await executeCommand(
//             "npm install typescript@latest --save-dev --force --no-global",
//             config.path
//           );
//           updateStatus("Vite installed locally", [
//             "Vite and related packages installed successfully in local node_modules",
//           ]);
//         } catch (localInstallError) {
//           // Fallback: install specific version that's known to work
//           await executeCommand(
//             "npm install vite@4.5.0 @vitejs/plugin-react@4.0.0 --save-dev --force",
//             config.path
//           );
//           updateStatus("Vite installed (stable version)", [
//             "Installed stable version of Vite locally",
//           ]);
//         }
//       }
//       updateStatus("Preparing build environment...", [
//         "Setting up React build environment",
//       ]);

//       // Ensure node_modules structure is correct
//       try {
//         // Check if vite is actually installed locally
//         await executeCommand("ls -la node_modules/vite/", config.path);
//         updateStatus("Vite directory confirmed", [
//           "Vite package directory exists in local node_modules",
//         ]);
//       } catch (lsError) {
//         updateStatus("Vite directory missing, forcing local reinstall...", [
//           "Reinstalling Vite locally",
//         ]);

//         // Nuclear option: completely reinstall everything locally
//         await executeCommand(
//           "rm -rf node_modules package-lock.json",
//           config.path
//         );
//         await executeCommand("npm cache clean --force", config.path);
//         await executeCommand("npm install --no-global", config.path);

//         // If package.json doesn't have vite, add it
//         try {
//           await executeCommand(
//             "npm install vite@latest @vitejs/plugin-react@latest typescript@latest --save-dev --no-global",
//             config.path
//           );
//         } catch (addError) {
//           // Fallback to stable versions
//           await executeCommand(
//             "npm install vite@4.5.0 @vitejs/plugin-react@4.0.0 --save-dev",
//             config.path
//           );
//         }
//       }

//       // Clear all Vite cache and temp files
//       await executeCommand(
//         "rm -rf node_modules/.vite node_modules/.vite-temp",
//         config.path
//       );

//       updateStatus("Building application...", [
//         "Running build with clean local environment",
//       ]);
//       try {
//         // First attempt: normal build
//         await executeCommand("npm run build", config.path);
//         updateStatus("Build completed successfully", []);
//       } catch (buildError) {
//         updateStatus("Build failed, trying local vite binary...", [
//           `Build error: ${buildError.message}`,
//         ]);

//         try {
//           // Try direct local vite command
//           await executeCommand("./node_modules/.bin/vite build", config.path);
//           updateStatus("Build completed (local binary)", [
//             "Build successful using local vite binary",
//           ]);
//         } catch (directError) {
//           try {
//             // Try with npx but force local resolution
//             await executeCommand(
//               "npx --prefer-offline vite build",
//               config.path
//             );
//             updateStatus("Build completed (npx offline)", [
//               "Build successful using npx with offline preference",
//             ]);
//           } catch (npxError) {
//             // Try building without TypeScript check
//             try {
//               await executeCommand(
//                 "npx --prefer-offline vite build --mode production",
//                 config.path
//               );
//               updateStatus("Build completed (production mode)", [
//                 "Build successful in production mode without type check",
//               ]);
//             } catch (prodError) {
//               // Last resort: manual build process
//               updateStatus("Attempting manual build...", [
//                 "Trying manual build process",
//               ]);
//               await executeCommand(
//                 "NODE_ENV=production ./node_modules/.bin/vite build --force",
//                 config.path
//               );
//               updateStatus("Build completed (manual)", [
//                 "Build successful using manual process",
//               ]);
//             }
//           }
//         }
//       }
//     }

//     updateStatus("Restarting application...", ["Restarting PM2 process"]);
//     try {
//       await executeCommand(`pm2 restart ${config.pm2Name}`);
//       updateStatus("Application restarted", [
//         `PM2 process ${config.pm2Name} restarted successfully`,
//       ]);
//     } catch (error) {
//       console.log(
//         `PM2 process ${config.pm2Name} not found, trying to start...`
//       );
//       try {
//         await executeCommand(`pm2 start ${config.pm2Name}`);
//         updateStatus("Application started", [
//           `PM2 process ${config.pm2Name} started successfully`,
//         ]);
//       } catch (startError) {
//         // Try with ecosystem file or direct start
//         await executeCommand(
//           `pm2 start npm --name "${config.pm2Name}" -- start`,
//           config.path
//         );
//         updateStatus("Application started (direct)", [
//           `PM2 process ${config.pm2Name} started directly`,
//         ]);
//       }
//     }

//     updateStatus("Verifying deployment...", ["Checking application status"]);
//     await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds for startup

//     const finalStatus = await getPM2Status(config.pm2Name);

//     const endTime = new Date();
//     if (finalStatus.status === "running") {
//       deploymentStatus.set(appName, {
//         ...deploymentStatus.get(appName),
//         status: "success",
//         step: "Deployment completed successfully",
//         logs: [
//           ...(deploymentStatus.get(appName)?.logs || []),
//           "Deployment successful!",
//           `Application is running on port ${config.port}`,
//         ],
//         endTime: endTime.toISOString(),
//       });

//       saveDeploymentToDB(
//         appName,
//         "deploy",
//         "success",
//         deployBranch,
//         deploymentStatus.get(appName)?.logs || [],
//         startTime,
//         endTime
//       );
//     } else {
//       throw new Error(
//         `Application failed to start after deployment. Status: ${finalStatus.status}`
//       );
//     }
//   } catch (error) {
//     console.error(`Deployment failed for ${appName}:`, error);
//     logError("Deployment failed", error);
//   }
// };

// const startApp = async (appName, config) => {
//   const updateStatus = (step, logs = []) => {
//     const current = deploymentStatus.get(appName) || {};
//     deploymentStatus.set(appName, {
//       ...current,
//       step,
//       logs: [...(current.logs || []), ...logs],
//     });
//   };

//   try {
//     updateStatus("Starting application...", [`Starting ${config.pm2Name}`]);

//     try {
//       await executeCommand(`pm2 start ${config.pm2Name}`);
//     } catch (error) {
//       updateStatus("Process not found", ["Creating new PM2 process"]);
//     }

//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     const status = await getPM2Status(config.pm2Name);
//     if (status.status === "running") {
//       deploymentStatus.set(appName, {
//         ...deploymentStatus.get(appName),
//         status: "success",
//         step: "Application started successfully",
//         logs: [
//           ...(deploymentStatus.get(appName)?.logs || []),
//           "Application is now running",
//         ],
//         endTime: new Date().toISOString(),
//       });
//     } else {
//       throw new Error("Failed to start application - PM2 process not running");
//     }
//   } catch (error) {
//     deploymentStatus.set(appName, {
//       ...deploymentStatus.get(appName),
//       status: "error",
//       step: "Failed to start application",
//       logs: [
//         ...(deploymentStatus.get(appName)?.logs || []),
//         `ERROR: ${error.message}`,
//       ],
//       endTime: new Date().toISOString(),
//     });
//   }
// };

// const stopApp = async (appName, config) => {
//   const updateStatus = (step, logs = []) => {
//     const current = deploymentStatus.get(appName) || {};
//     deploymentStatus.set(appName, {
//       ...current,
//       step,
//       logs: [...(current.logs || []), ...logs],
//     });
//   };

//   try {
//     updateStatus("Stopping application...", [`Stopping ${config.pm2Name}`]);
//     await executeCommand(`pm2 stop ${config.pm2Name}`);

//     deploymentStatus.set(appName, {
//       ...deploymentStatus.get(appName),
//       status: "success",
//       step: "Application stopped successfully",
//       logs: [
//         ...(deploymentStatus.get(appName)?.logs || []),
//         "Application has been stopped",
//       ],
//       endTime: new Date().toISOString(),
//     });
//   } catch (error) {
//     deploymentStatus.set(appName, {
//       ...deploymentStatus.get(appName),
//       status: "error",
//       step: "Failed to stop application",
//       logs: [
//         ...(deploymentStatus.get(appName)?.logs || []),
//         `ERROR: ${error.message}`,
//       ],
//       endTime: new Date().toISOString(),
//     });
//   }
// };

module.exports = systemAdminRouter;
