log_format mqtt '$remote_addr [$time_local] $protocol $status $bytes_received '
                '$bytes_sent $upstream_addr';

upstream hive_mq {
    server 127.0.0.1:9001;
    zone tcp_mem 64k;
}

match mqtt_conn {
        # Send CONNECT packet with client ID "nginx health check"
        send   \x10\x20\x00\x06\x4d\x51\x49\x73\x64\x70\x03\x02\x00\x3c\x00\x12\x6e\x67\x69\x6e\x78\x20\x68\x65\x61\x6c\x74\x68\x20\x63\x68\x65\x63\x6b;
        expect \x20\x02\x00\x00; # Entire payload of CONNACK packet
}

server {
    listen 9001;
    proxy_pass hive_mq;
    proxy_connect_timeout 1s;
    health_check match=mqtt_conn;

    access_log /var/log/nginx/mqtt_access.log mqtt;
    error_log  /var/log/nginx/mqtt_error.log; # Health check notifications
}
