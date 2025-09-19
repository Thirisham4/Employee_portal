
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ------------------ LOGIN ROUTE ------------------
app.post("/api/employee/login", async (req, res) => {
  const { employeeId, password } = req.body;
  const soapBody = `
  <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                 xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
    <soap:Header/>
    <soap:Body>
      <n0:ZthiEmplogFm xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
        <EmployeeId>${employeeId}</EmployeeId>
        <Password>${password}</Password>
      </n0:ZthiEmplogFm>
    </soap:Body>
  </soap:Envelope>`;

  try {
    const { data } = await axios.post(
      "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zemp_rfc_login?sap-client=100",
      soapBody,
      {
        headers: {
          "Content-Type": "application/soap+xml",
        },
        auth: {
          username: process.env.SAP_USER,
          password: process.env.SAP_PASS,
        },
      }
    );

    xml2js.parseString(data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ error: "Parse error" });

      const verification =
        result["env:Envelope"]["env:Body"]["n0:ZthiEmplogFmResponse"]["Verification"];
      res.json({ status: "X", message: verification });
    });
  } catch (error) {
    res.status(500).json({ error: "Login request failed" });
  }
});

// ------------------ PROFILE ROUTE ------------------
app.post("/api/employee/profile", async (req, res) => {
  const { employeeId } = req.body;
  const soapBody = `
  <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                 xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
    <soap:Header/>
    <soap:Body>
      <n0:ZthiEmpProfFm xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
        <IvPernr>${employeeId}</IvPernr>
      </n0:ZthiEmpProfFm>
    </soap:Body>
  </soap:Envelope>`;

  try {
    const { data } = await axios.post(
      "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zemp_rfc_prof?sap-client=100",
      soapBody,
      {
        headers: {
          "Content-Type": "application/soap+xml",
        },
        auth: {
          username: process.env.SAP_USER,
          password: process.env.SAP_PASS,
        },
      }
    );

    xml2js.parseString(data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ error: "Parse error" });

      const profile = result["env:Envelope"]["env:Body"]["n0:ZthiEmpProfFmResponse"];
      res.json({
        status: "X",
        message: "Profile fetched successfully",
        profile: {
          fullName: profile.EvFullname,
          gender: profile.EvGender,
          dob: profile.EvDob,
          email: profile.EvEmail,
          phone: profile.EvPhone,
          companyCode: profile.EvCompCode,
          department: profile.EvDepartment,
          position: profile.EvPosition,
          orgUnit: profile.EvOrgUnit,
          address: profile.EvAddress,
        },
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Profile request failed" });
  }
});

// ------------------ LEAVE ROUTE ------------------
app.post("/api/employee/leave", async (req, res) => {
  const { employeeId } = req.body;
  const soapBody = `
  <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                 xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
    <soap:Header/>
    <soap:Body>
      <n0:ZthiEmpLeaveFm xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
        <EmployeeId>${employeeId}</EmployeeId>
      </n0:ZthiEmpLeaveFm>
    </soap:Body>
  </soap:Envelope>`;

  try {
    const { data } = await axios.post(
      "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zemp_rfc_leave?sap-client=100",
      soapBody,
      {
        headers: {
          "Content-Type": "application/soap+xml",
        },
        auth: {
          username: process.env.SAP_USER,
          password: process.env.SAP_PASS,
        },
      }
    );

    xml2js.parseString(data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ error: "Parse error" });

      let items =
        result["env:Envelope"]["env:Body"]["n0:ZthiEmpLeaveFmResponse"]["LeaveDetails"]["item"];
      if (!Array.isArray(items)) items = [items];

      const formattedLeaves = items.map((entry) => ({
        empId: entry.EmpId,
        startDate: entry.StartDate,
        endDate: entry.EndDate,
        abType: entry.AbType,
        abDays: entry.AbDays,
        reason: entry.Reason,
        quotaNumber: entry.QuotaNumber,
        startDateQuota: entry.StartDateQuota,
        endDateQuota: entry.EndDateQuota,
      }));

      res.json({ status: "X", message: "Leave fetched", leaves: formattedLeaves });
    });
  } catch (error) {
    res.status(500).json({ error: "Leave request failed" });
  }
});


// ------------------------------------- PAY ---------------------------------------------------


// app.post("/api/employee/pay", async (req, res) => {
//   const { employeeId } = req.body;
//   const soapBody = `
//   <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
//                  xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
//     <soap:Header/>
//     <soap:Body>
//       <n0:ZthiEmpPayFm xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
//         <EmployeeId>${employeeId}</EmployeeId>
//       </n0:ZthiEmpPayFm>
//     </soap:Body>
//   </soap:Envelope>`;

//   try {
//     const { data } = await axios.post(
//       "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zemp_rfc_pay?sap-client=100",
//       soapBody,
//       {
//         headers: {
//           "Content-Type": "application/soap+xml",
//         },
//         auth: {
//           username: process.env.SAP_USER,
//           password: process.env.SAP_PASS,
//         },
//       }
//     );

//     xml2js.parseString(data, { explicitArray: false }, (err, result) => {
//       if (err) return res.status(500).json({ error: "Parse error" });

//       const items =
//         result["env:Envelope"]["env:Body"]["n0:ZthiEmpPayFmResponse"]["PayslipDetails"]["item"];
//       const payslips = Array.isArray(items) ? items : [items];

//       res.json({
//         status: "X",
//         message: "Payslip data fetched",
//         payslips,
//       });
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Pay request failed" });
//   }
// });



//-----------------------------------------------------PAY----------------------------------------------------------------


app.post("/api/employee/pay", async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ error: "Employee ID is required" });
  }

  const soapBody = `
  <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                 xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
    <soap:Header/>
    <soap:Body>
      <urn:ZthiEmpPayFm>
        <EmployeeId>${employeeId}</EmployeeId>
      </urn:ZthiEmpPayFm>
    </soap:Body>
  </soap:Envelope>`;

  try {
    const { data } = await axios.post(
      "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zemp_rfc_pay?sap-client=100",
      soapBody,
      {
        headers: {
          "Content-Type": "application/soap+xml;charset=UTF-8", // SOAP 1.2
        },
        auth: {
          username: process.env.SAP_USER,
          password: process.env.SAP_PASS,
        },
      }
    );

    xml2js.parseString(data, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error("XML Parsing Error:", err);
        return res.status(500).json({ error: "Failed to parse SOAP response" });
      }

      const payslipItems =
        result?.["env:Envelope"]?.["env:Body"]?.["n0:ZthiEmpPayFmResponse"]?.["PayslipDetails"]?.["item"];

      const payslips = Array.isArray(payslipItems) ? payslipItems : [payslipItems];

      if (!payslipItems) {
        return res.status(404).json({ message: "No payslip records found" });
      }

      res.status(200).json({
        status: "X",
        message: "Payslip data fetched successfully",
        payslips,
      });
    });
  } catch (error) {
    console.error("SOAP Request Failed:", error.message);
    res.status(500).json({ error: "Pay request failed" });
  }
});



// -------------------- EMPLOYEE PAYSLIP PDF DOWNLOAD --------------------
app.post("/api/employee/payslip/pdf", async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ error: "Employee ID is required" });
  }

  const soapEnvelope = `
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                   xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
      <soap:Header/>
      <soap:Body>
        <urn:ZthiEmpPaypdfFm>
          <EmployeeId>${employeeId}</EmployeeId>
        </urn:ZthiEmpPaypdfFm>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    const { data } = await axios.post(
      process.env.SAP_EMP_PAYSLIP_PDF_URL,
      soapEnvelope,
      {
        headers: {
          "Content-Type": "application/soap+xml;charset=UTF-8",
        },
        auth: {
          username: process.env.SAP_USER,
          password: process.env.SAP_PASS,
        },
        responseType: "text",
      }
    );

    const result = await xml2js.parseStringPromise(data, { explicitArray: false });

    const base64PDF =
      result?.["env:Envelope"]?.["env:Body"]?.["n0:ZthiEmpPaypdfFmResponse"]?.["PayslipPdf"];

    if (!base64PDF || typeof base64PDF !== "string") {
      console.error("❌ PDF content missing in response:", JSON.stringify(result, null, 2));
      return res.status(500).json({ error: "Invalid PDF base64 in SAP response" });
    }

    const pdfBuffer = Buffer.from(base64PDF, "base64");

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="payslip_${employeeId}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (error) {
    console.error("❌ PDF Download Error:", error.message);
    if (error.response?.data) {
      console.error("🔍 SAP Raw Response:", error.response.data);
    }
    res.status(500).json({ error: "Failed to download payslip PDF" });
  }
});


//-------------------------------------------------------------------------------------------------------------------------//

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

