package com.bank.balancereader.repository;

import com.bank.balancereader.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    @Query("SELECT COALESCE(SUM(CASE WHEN t.toAccountId = :accountId THEN t.amount ELSE 0 END) - " +
           "SUM(CASE WHEN t.fromAccountId = :accountId THEN t.amount ELSE 0 END), 0) " +
           "FROM Transaction t WHERE t.toAccountId = :accountId OR t.fromAccountId = :accountId")
    BigDecimal calculateBalance(@Param("accountId") String accountId);
}

