import type { BankPartner, SoapTransaction, SoapGatewayConfig } from "./types";

export const initialSoapGatewayConfig: SoapGatewayConfig = {
  endpointUrl: "https://hrm.company.local/soap/payroll",
  wsdlUrl: "https://hrm.company.local/soap/payroll?wsdl",
  serviceName: "PayrollDirectDisbursementService",
  port: 8443,
  securityMode: "TransportWithMessageCredential (mTLS + X.509)",
  allowedIPs: ["203.162.10.45", "118.70.124.8", "123.30.55.19", "14.161.32.90"],
  status: "healthy",
  lastPingTime: "17/09/2026 07:50:12",
  avgResponseTime: "128ms",
};

export const initialBankPartners: BankPartner[] = [
  {
    id: "vtb",
    name: "Ngân hàng TMCP Công Thương Việt Nam (VietinBank)",
    shortName: "VietinBank",
    accountNumber: "110028495821",
    accountName: "CONG TY TNHH HE THONG HRM",
    branch: "Chi nhánh Hoàn Kiếm, Hà Nội",
    balance: 1850000000,
    isPrimary: true,
    status: "active",
    soapProtocol: "SOAP 1.2 / HTTPS mTLS",
    mTLSStatus: "valid",
    certExpiry: "15/12/2027",
  },
  {
    id: "vcb",
    name: "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)",
    shortName: "Vietcombank",
    accountNumber: "0011004829104",
    accountName: "CONG TY TNHH HE THONG HRM",
    branch: "Sở Giao Dịch Hà Nội",
    balance: 920000000,
    isPrimary: false,
    status: "active",
    soapProtocol: "SOAP 1.2 / HTTPS mTLS",
    mTLSStatus: "valid",
    certExpiry: "20/09/2027",
  },
  {
    id: "bidv",
    name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)",
    shortName: "BIDV",
    accountNumber: "1201000984128",
    accountName: "CONG TY TNHH HE THONG HRM",
    branch: "Chi nhánh Cầu Giấy, Hà Nội",
    balance: 450000000,
    isPrimary: false,
    status: "standby",
    soapProtocol: "SOAP 1.1 / WSSecurity",
    mTLSStatus: "valid",
    certExpiry: "05/06/2028",
  },
];

export const initialSoapTransactions: SoapTransaction[] = [
  {
    id: "SOAP-TXN-202608-01",
    batchName: "Chi lương toàn diện Kỳ 08/2026",
    bankName: "VietinBank",
    totalEmployees: 18,
    totalAmount: 154200000,
    status: "success",
    createdAt: "16/08/2026 09:15:30",
    completedAt: "16/08/2026 09:15:34",
    bankReference: "VTB-FT-99201948",
    soapAction: "ConfirmPayrollTransfer",
    xmlPayload: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:pay="http://hrm.company.local/soap/payroll">
  <soap:Header>
    <pay:AuthToken>VTB_mTLS_SEC_KEY_8829FBA7</pay:AuthToken>
    <pay:RequestTimestamp>2026-08-16T09:15:30Z</pay:RequestTimestamp>
  </soap:Header>
  <soap:Body>
    <pay:ConfirmPayrollTransferRequest>
      <pay:BatchId>PAY-202608-BATCH01</pay:BatchId>
      <pay:SourceAccount>110028495821</pay:SourceAccount>
      <pay:TotalBeneficiaries>18</pay:TotalBeneficiaries>
      <pay:TotalAmount Currency="VND">154200000</pay:TotalAmount>
      <pay:ExecutionMode>IMMEDIATE</pay:ExecutionMode>
    </pay:ConfirmPayrollTransferRequest>
  </soap:Body>
</soap:Envelope>`,
    xmlResponse: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:pay="http://hrm.company.local/soap/payroll">
  <soap:Body>
    <pay:ConfirmPayrollTransferResponse>
      <pay:Status>SUCCESS</pay:Status>
      <pay:BankReference>VTB-FT-99201948</pay:BankReference>
      <pay:ProcessedCount>18</pay:ProcessedCount>
      <pay:SuccessfulCount>18</pay:SuccessfulCount>
      <pay:FeeAmount Currency="VND">0</pay:FeeAmount>
      <pay:ExecutionTimeMs>124</pay:ExecutionTimeMs>
    </pay:ConfirmPayrollTransferResponse>
  </soap:Body>
</soap:Envelope>`,
  },
  {
    id: "SOAP-TXN-202607-02",
    batchName: "Quyết toán Bảng lương Kỳ 07/2026",
    bankName: "VietinBank",
    totalEmployees: 18,
    totalAmount: 148500000,
    status: "success",
    createdAt: "16/07/2026 10:20:00",
    completedAt: "16/07/2026 10:20:05",
    bankReference: "VTB-FT-88402911",
    soapAction: "ConfirmPayrollTransfer",
    xmlPayload: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:pay="http://hrm.company.local/soap/payroll">
  <soap:Header>
    <pay:AuthToken>VTB_mTLS_SEC_KEY_8829FBA7</pay:AuthToken>
    <pay:RequestTimestamp>2026-07-16T10:20:00Z</pay:RequestTimestamp>
  </soap:Header>
  <soap:Body>
    <pay:ConfirmPayrollTransferRequest>
      <pay:BatchId>PAY-202607-BATCH01</pay:BatchId>
      <pay:SourceAccount>110028495821</pay:SourceAccount>
      <pay:TotalBeneficiaries>18</pay:TotalBeneficiaries>
      <pay:TotalAmount Currency="VND">148500000</pay:TotalAmount>
    </pay:ConfirmPayrollTransferRequest>
  </soap:Body>
</soap:Envelope>`,
    xmlResponse: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:pay="http://hrm.company.local/soap/payroll">
  <soap:Body>
    <pay:ConfirmPayrollTransferResponse>
      <pay:Status>SUCCESS</pay:Status>
      <pay:BankReference>VTB-FT-88402911</pay:BankReference>
      <pay:ProcessedCount>18</pay:ProcessedCount>
      <pay:SuccessfulCount>18</pay:SuccessfulCount>
      <pay:ExecutionTimeMs>118</pay:ExecutionTimeMs>
    </pay:ConfirmPayrollTransferResponse>
  </soap:Body>
</soap:Envelope>`,
  },
  {
    id: "SOAP-TXN-202608-ADV01",
    batchName: "Tạm ứng lương đợt 1 (3 nhân viên)",
    bankName: "Vietcombank",
    totalEmployees: 3,
    totalAmount: 9500000,
    status: "success",
    createdAt: "10/08/2026 14:05:12",
    completedAt: "10/08/2026 14:05:14",
    bankReference: "VCB-FT-33921820",
    soapAction: "RequestSalaryAdvance",
    xmlPayload: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:pay="http://hrm.company.local/soap/payroll">
  <soap:Header>
    <pay:AuthToken>VCB_SEC_WSS_7718A09</pay:AuthToken>
  </soap:Header>
  <soap:Body>
    <pay:RequestSalaryAdvanceRequest>
      <pay:BatchId>ADV-202608-B1</pay:BatchId>
      <pay:SourceAccount>0011004829104</pay:SourceAccount>
      <pay:TotalAmount Currency="VND">9500000</pay:TotalAmount>
    </pay:RequestSalaryAdvanceRequest>
  </soap:Body>
</soap:Envelope>`,
    xmlResponse: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:pay="http://hrm.company.local/soap/payroll">
  <soap:Body>
    <pay:RequestSalaryAdvanceResponse>
      <pay:Status>SUCCESS</pay:Status>
      <pay:BankReference>VCB-FT-33921820</pay:BankReference>
      <pay:ProcessedCount>3</pay:ProcessedCount>
    </pay:RequestSalaryAdvanceResponse>
  </soap:Body>
</soap:Envelope>`,
  },
];
