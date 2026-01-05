package com.bank.ledgerwriter.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransferRequest {
    private String fromAccountId;
    private String toAccountId;
    private BigDecimal amount;
    private String label;
}

