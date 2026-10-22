"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faPlay,
  faPlus,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import BankHeaderStats from "@/features/bank/components/BankStats";
import BankPartnersList from "@/features/bank/components/BankPartners";
import SoapTransactionsTable from "@/features/bank/components/SoapHistory";
import SoapTestModal from "@/features/bank/components/modals/SoapTest";
import SoapPayloadDetailModal from "@/features/bank/components/modals/PayloadDetail";
import CreatePayrollDisbursementModal from "@/features/bank/components/modals/PayoutCreate";
import BankConfigModal from "@/features/bank/components/modals/BankForm";
import {
  initialBankPartners,
  initialSoapGatewayConfig,
  initialSoapTransactions,
} from "@/features/bank/mock";
import type { BankPartner, SoapTransaction } from "@/features/bank/types";

export default function BankIntegrationPage() {
  const [partners, setPartners] = useState<BankPartner[]>(initialBankPartners);
  const [transactions, setTransactions] = useState<SoapTransaction[]>(
    initialSoapTransactions
  );
  const [gatewayConfig] = useState(initialSoapGatewayConfig);

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [createDisburseOpen, setCreateDisburseOpen] = useState(false);
  const [selectedPayloadTx, setSelectedPayloadTx] =
    useState<SoapTransaction | null>(null);
  const [selectedBankConfig, setSelectedBankConfig] =
    useState<BankPartner | null>(null);

  const handleSetPrimary = (bankId: string) => {
    setPartners((prev) =>
      prev.map((p) => ({
        ...p,
        isPrimary: p.id === bankId,
      }))
    );
  };

  const handleDisburseSuccess = (newTx: SoapTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Liên kết Ngân hàng & Chi lương Tự động"
        breadcrumb={[
          { label: "HRM", href: "#" },
          { label: "Ngân hàng & Chi lương" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="white"
              onClick={() => setTestModalOpen(true)}
              className="text-xs"
            >
              <FontAwesomeIcon icon={faRotateRight} fontSize={12} /> Kiểm tra đường truyền
            </Button>
            <Button
              onClick={() => setCreateDisburseOpen(true)}
              className="text-xs"
            >
              <FontAwesomeIcon icon={faPlus} fontSize={12} /> Tạo lệnh chi lương mới
            </Button>
          </div>
        }
      />

      {/* 1. Thẻ thống kê tổng quan Gateway & Tài khoản */}
      <BankHeaderStats
        gatewayConfig={gatewayConfig}
        partners={partners}
        transactions={transactions}
        onTestSoap={() => setTestModalOpen(true)}
      />

      {/* 2. Danh sách Ngân hàng Đối tác liên kết */}
      <BankPartnersList
        partners={partners}
        onSetPrimary={handleSetPrimary}
        onOpenConfig={(p) => setSelectedBankConfig(p)}
      />

      {/* 3. Bảng Lịch sử Lệnh Chi lương SOAP API */}
      <SoapTransactionsTable
        transactions={transactions}
        onViewPayload={(t) => setSelectedPayloadTx(t)}
        onCreateDisbursement={() => setCreateDisburseOpen(true)}
      />

      {/* Modals */}
      <SoapTestModal
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        config={gatewayConfig}
      />

      <CreatePayrollDisbursementModal
        open={createDisburseOpen}
        onClose={() => setCreateDisburseOpen(false)}
        partners={partners}
        onDisburseSuccess={handleDisburseSuccess}
      />

      <SoapPayloadDetailModal
        transaction={selectedPayloadTx}
        onClose={() => setSelectedPayloadTx(null)}
      />

      <BankConfigModal
        partner={selectedBankConfig}
        onClose={() => setSelectedBankConfig(null)}
      />
    </div>
  );
}
