security set-generic-password-partition-list -S "apple-tool:,apple:" -s 'Xerox - B&W (AirPrint)' -k $PASSWORD

node: teamid:HX7739G8FX
viscosity: teamid:34XR7GXFPX
tunnelblick: teamid:Z2SG5H3HC8

http://mostlikelee.com/blog-1/2017/9/16/scripting-the-macos-keychain-partition-ids

```bash
security add-generic-password -a ${CURRENTUSER}@${YOUR_DOMAIN} -s Exchange -w $PASSWORD -T /Applications/Microsoft\ Outlook.app

OS_MIN_VERS=$(sw_vers | grep ProductVersion | awk '{print $2}' | cut -d "." -f2)

if [ $OS_MIN_VERS -ge 12 ]; then
security set-generic-password-partition-list -S teamid:UBF8T346G9 -s Exchange -k $PASSWORD
fi
```

https://www.jamf.com/jamf-nation/discussions/22304/yet-another-keychain-security-command-line-tool-question
https://stackoverflow.com/questions/39868578/security-codesign-in-sierra-keychain-ignores-access-control-settings-and-ui-p/40870033
