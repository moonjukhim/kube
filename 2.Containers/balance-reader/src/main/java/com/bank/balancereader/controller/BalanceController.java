package com.bank.balancereader.controller;

import com.bank.balancereader.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BalanceController {
    
    private final TransactionRepository transactionRepository;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "healthy"));
    }
    
    @GetMapping("/balance/{accountId}")
    public ResponseEntity<Map<String, Object>> getBalance(@PathVariable String accountId) {
        BigDecimal balance = transactionRepository.calculateBalance(accountId);
        
        return ResponseEntity.ok(Map.of(
                "accountId", accountId,
                "balance", balance != null ? balance : BigDecimal.ZERO
        ));
    }
}

