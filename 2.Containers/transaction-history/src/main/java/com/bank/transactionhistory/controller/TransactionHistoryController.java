package com.bank.transactionhistory.controller;

import com.bank.transactionhistory.entity.Transaction;
import com.bank.transactionhistory.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionHistoryController {
    
    private final TransactionRepository transactionRepository;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "healthy"));
    }
    
    @GetMapping("/transactions/{accountId}")
    public ResponseEntity<Map<String, Object>> getTransactions(@PathVariable String accountId) {
        List<Transaction> transactions = transactionRepository.findByAccountId(accountId);
        
        List<Map<String, Object>> formattedTransactions = transactions.stream()
                .map(t -> {
                    boolean isCredit = t.getToAccountId().equals(accountId);
                    String otherAccount = isCredit ? t.getFromAccountId() : t.getToAccountId();
                    
                    return Map.<String, Object>of(
                            "id", t.getId().toString(),
                            "date", t.getTimestamp().toString(),
                            "type", isCredit ? "credit" : "debit",
                            "account", otherAccount,
                            "label", t.getLabel() != null ? t.getLabel() : "",
                            "amount", isCredit ? t.getAmount() : t.getAmount().negate()
                    );
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(Map.of("transactions", formattedTransactions));
    }
}

