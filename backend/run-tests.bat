@echo off
REM KindLink Backend Test Execution Script for Windows
REM Usage:
REM   run-tests.bat         (run all tests with coverage)
REM   run-tests.bat auth    (run authentication & authorization tests)
REM   run-tests.bat profile (run profile management tests)
REM   run-tests.bat reviews (run rating & feedback tests)
REM   run-tests.bat core    (run auth, profile, and reviews tests)

cd /d "%~dp0"
node scripts\run-tests.js %1
