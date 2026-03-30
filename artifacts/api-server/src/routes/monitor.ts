import { Router, type IRouter } from "express";
import { BigQuery } from "@google-cloud/bigquery";

const router: IRouter = Router();

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || "gwc-poc-487320";

const bq = new BigQuery({ projectId: GCP_PROJECT_ID, location: "us-central1" });

router.get("/monitor/contact-daily-counts", async (req, res, next) => {
  try {
    const startDate = (req.query.startDate as string) || "2026-01-01";

    const query = `
      SELECT
        DATE(contact_start_date) AS contact_date,
        EXTRACT(DAYOFWEEK FROM DATE(contact_start_date)) AS dow,
        COUNT(*) AS contact_count
      FROM \`${GCP_PROJECT_ID}.incontact.calls\`
      WHERE DATE(contact_start_date) >= @startDate
      GROUP BY contact_date, dow
      ORDER BY contact_date
    `;

    const [rows] = await bq.query({
      query,
      params: { startDate },
      location: "us-central1",
    });

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
