# post-rcv
simple nodejs file put


## usage

### server
- `npm install`
- configure `config/config.yaml` to your needs.
- setup public-url
- `npm start`
- file storage location: `incoming-directory/hostname/YYYYMMDD-HHmmss_filename`

### client
- `curl -s public-url > upload.sh`
- `chmod +x upload.sh`
- `./upload.sh /path/to/file`
