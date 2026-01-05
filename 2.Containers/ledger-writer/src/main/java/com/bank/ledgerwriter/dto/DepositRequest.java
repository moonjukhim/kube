package com.bank.ledgerwriter.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DepositRequest {
    private String accountId;
    private BigDecimal amount;
    private String label;
}

