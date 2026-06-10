# DIRECTIVE 9 TRAVEL RULE COMPLIANCE ARCHITECTURE

## 1. TRANSACTION INTERMEDIARY ANALYSIS
The Platform relies entirely on peer-to-peer user wallet authentication via the Pi Network SDK wrapper for processing utility payments. It does not operate internal asset custody accounts or function as a commercial financial intermediary.

## 2. AUTOMATED R5,000 EXCLUSION FILTER & COMPLIANCE DATA STREAMING
If the platform integrates optional direct trading features or custom asset exchanges, the system automatically runs compliance filtering scripts. 

For any internal transfer matching or exceeding five thousand South African Rand (R5,000) in equivalent value, the system blocks processing until the following transaction metadata is packaged and validated:
- The full legal name of the originating wallet holder.
- The physical identification code or national identification number of the transaction originator.
- The public ledger addresses for both the originator and beneficiary.

This packed data is securely archived within our application logging layer, ensuring compliance with South African Directive 9 mandates for financial metadata transfers.
