package com.bank.ledgerwriter.controller;

import com.bank.ledgerwriter.dto.DepositRequest;
import com.bank.ledgerwriter.dto.TransferRequest;
import com.bank.ledgerwriter.entity.Transaction;
import com.bank.ledgerwriter.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LedgerController {
    
    private final TransactionRepository transactionRepository;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "healthy"));
    }
    
    @PostMapping("/deposit")
    public ResponseEntity<Map<String, Object>> deposit(@RequestBody DepositRequest request) {
        Transaction transaction = Transaction.builder()
                .fromAccountId("EXTERNAL")
                .toAccountId(request.getAccountId())
                .amount(request.getAmount())
                .label(request.getLabel() != null ? request.getLabel() : "Deposit")
                .timestamp(LocalDateTime.now())
                .transactionType("DEPOSIT")
                .build();
        
        transactionRepository.save(transaction);
        
        return ResponseEntity.ok(Map.of(
                "message", "Deposit successful",
                "transactionId", transaction.getId()
        ));
    }
    
    @PostMapping("/transfer")
    public ResponseEntity<Map<String, Object>> transfer(@RequestBody TransferRequest request) {
        if (request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Amount must be positive"));
        }
        
        Transaction transaction = Transaction.builder()
                .fromAccountId(request.getFromAccountId())
                .toAccountId(request.getToAccountId())
                .amount(request.getAmount())
                .label(request.getLabel() != null ? request.getLabel() : "Transfer")
                .timestamp(LocalDateTime.now())
                .transactionType("TRANSFER")
                .build();
        
        transactionRepository.save(transaction);
        
        return ResponseEntity.ok(Map.of(
                "message", "Transfer successful",
                "transactionId", transaction.getId()
        ));
    }
}

