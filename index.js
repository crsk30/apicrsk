//  While deploying to AWS Lambda, 
// each function (Stock data and Email sending) would be separate.
//  So Install Only the required packages for each function.


//  for Stock data Lambda function
const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
 
//  For sending emails Lambda function
const nodemailer = require("nodemailer");
const parser = require("lambda-multipart-parser");
const multer = require("multer");
// const upload = multer();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// For Calender events Lambda function
const fs = require("fs");
const csv = require("csv-parser");


const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true })); // parses form-urlencoded

app.get('/', async (req, res) => {
    console.log("Ticker received:", );
    try {
        console.log("Fetched stock data:");
        res.json({message: "Server is up and running"});
    } catch (error) {
        console.log("Error fetching stock data:", error);
        res.status(500).json({ error: 'Failed to fetch stock data.' });
    }
});

// Route to fetch stock data for a given ticker
app.get('/stock/:ticker', async (req, res) => {
    const ticker = req.params.ticker;
    console.log("Ticker received:", ticker);
    try {
        const quote = await yahooFinance.historical(ticker,{
        period1: "2023-01-01",
        period2: "2023-01-31",
        interval: '1d'
        });
        console.log("Fetched stock data:", quote);
        res.json(quote);
    } catch (error) {
        console.log("Error fetching stock data:", error);
        res.status(500).json({ error: 'Failed to fetch stock data.' });
    }
});


app.post('/email', upload.array("attachments", 5), async (req, res) => {
      console.log("---- BODY ----");
  console.log(req.body);

  console.log("---- FILES ----");
  console.log(req.files);

  res.json({
    body: req.body,
    files: req.files.map(f => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size
    }))
  });
  try {
    // ✅ Extract form fields
    const { to, from, subject, cc, bcc, body } = req.body;

    // ✅ Extract attachments
    console.log("Files received:", req.files);
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
      }));
    }

    // ✅ Nodemailer transport (example: Gmail)
    let transporter = nodemailer.createTransport({
      service: "gmail", // or SES SMTP, etc.
      auth: {
        user: process.env.GMAIL_USER || "sai.crsk30@gmail.com",
        pass: process.env.GMAIL_PASS || "zdgplxxgjjdfzezv",
      },
    });

    // ✅ Email object
    const mailOptions = {
      from: from || process.env.GMAIL_USER,
      to,
      cc,
      bcc,
      subject,
      text: body,
      html: body,
      attachments,
    };

    // ✅ Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    return res.send({
      message: "Email sent successfully!",
      id: info.messageId,
    }); 
  } catch (err) {
    console.error("Error sending email:", err);
    return res.send({ error: "Fail" });
  }
});

app.get("/calendar",async (req,res)=>{
    const results = [];

    console.log(req.query.date)
  fs.createReadStream("data.csv")   // replace with your CSV file path
    .pipe(csv())
    .on("data", (row) => {
      if(row.date == req.query.date){
      console.log("Row:", row.date );
        results.push(row); // Each row is a JS object
      }
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
      res.json({
        message: "CSV Data",
        data: results
      });
    })
    .on("error", (err) => {
      console.error("Error reading CSV:", err);
      res.status(500).json({ error: "Failed to read CSV file" });
    });
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});