����firewalld��systemd��һЩ�����ټ�
======

[TOC]

ǰ��
------

CentOS 7 �Ѿ���firewalld�滻����iptables����systemd��������������֮ǰ��chkconfig����������һ��Ubuntu�ĳ���֧�ְ�ҲҪ��ô���ˡ�

�����������ڲ����Ϻ�֮ǰ��ϵͳ�кܶ�ı仯�����Լ��м�¼һ�³��õ��������ÿ�ζ�Ҫ���������档

firewalld
------

����firewalld��http://fedoraproject.org/wiki/FirewallD/zh-cn

ͼ�λ����ù��ߣ� firewall-config

�����й��ߣ�firewall-cmd


Ĭ������λ�ڣ� /usr/lib/firewalld

�û�����λ�ڣ� /etc/firewalld

### ��ӷ���
�� /etc/firewalld/services ���� [��������].xml
��ʽ����:
```xml
<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>��������</short>
  <description>�������� server port whitelist</description>
  <port protocol="Э��" port="�˿�"/>
  <port protocol="tcp" port="8001"/>
</service>
```

### ����������

����ӷ������ƣ����Դ�/usr/lib/firewalld/zones������/etc/firewalld/zonesȻ��ġ�

��Ҫ�����ǿ���ĳһ����������Щ������߶˿�

### ��������
```bash
# ����
firewall-cmd --reload
# ״̬
firewall-cmd --state

# ���/�Ƴ�/��ѯ����
firewall-cmd [--permanent] [--zone=<zone>] --add-service=<service> [--timeout=<seconds>]
firewall-cmd [--zone=<zone>] --remove-service=<service>
firewall-cmd [--zone=<zone>] --query-service=<service>

# ���/�Ƴ�/��ѯ�˿�
firewall-cmd [--zone=<zone>] --add-port=<port>[-<port>]/<protocol> [--timeout=<seconds>]
firewall-cmd [--zone=<zone>] --remove-port=<port>[-<port>]/<protocol>
firewall-cmd [--zone=<zone>] --query-port=<port>[-<port>]/<protocol>

# ���/�Ƴ�/��ѯ�˿�ת��
firewall-cmd [--zone=<zone>] --add-forward-port=port=<port>[-<port>]:proto=<protocol> { :toport=<port>[-<port>] | :toaddr=<address> | :toport=<port>[-<port>]:toaddr=<address> }
firewall-cmd [--zone=<zone>] --remove-forward-port=port=<port>[-<port>]:proto=<protocol> { :toport=<port>[-<port>] | :toaddr=<address> | :toport=<port>[-<port>]:toaddr=<address> }
firewall-cmd [--zone=<zone>] --query-forward-port=port=<port>[-<port>]:proto=<protocol> { :toport=<port>[-<port>] | :toaddr=<address> | :toport=<port>[-<port>]:toaddr=<address> }
# ��: ������home��sshת����127.0.0.2
firewall-cmd --zone=home --add-forward-port=port=22:proto=tcp:toaddr=127.0.0.2

# ֱ�ӷ��ʣ�����iptable�Ĳ�����
firewall-cmd [--permanent] --direct --get-all-chains
firewall-cmd [--permanent] --direct --get-chains { ipv4 | ipv6 | eb } table
firewall-cmd [--permanent] --direct --add-chain { ipv4 | ipv6 | eb } table chain
firewall-cmd [--permanent] --direct --remove-chain { ipv4 | ipv6 | eb } table chain
firewall-cmd [--permanent] --direct --query-chain { ipv4 | ipv6 | eb } table chain

firewall-cmd [--permanent] --direct --get-all-rules
firewall-cmd [--permanent] --direct --get-rules{ ipv4 | ipv6 | eb } table
firewall-cmd [--permanent] --direct --add-rules{ ipv4 | ipv6 | eb } table chain priority args
firewall-cmd [--permanent] --direct --remove-rules{ ipv4 | ipv6 | eb } table chain priority args
firewall-cmd [--permanent] --direct --query-rules{ ipv4 | ipv6 | eb } table chain priority args

firewall-cmd [--permanent] --direct --get-all-passthroughs
firewall-cmd [--permanent] --direct --get-passthroughs{ ipv4 | ipv6 | eb }
firewall-cmd [--permanent] --direct --add-passthroughs{ ipv4 | ipv6 | eb } args
firewall-cmd [--permanent] --direct --remove-passthroughs{ ipv4 | ipv6 | eb } args
firewall-cmd [--permanent] --direct --query-passthroughs{ ipv4 | ipv6 | eb } args

# ֱ�ӷ�������
firewall-cmd --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 80 -j ACCEPT

# ��ȡ���п������ü�
firewall-cmd --get-zones
firewall-cmd --list-all-zones

# ��ȡ���п��÷���
firewall-cmd --get-services
firewall-cmd --get-icmptypes

# ��ȡ�Ѿ����õķ���
firewall-cmd [--zone=<zone>] --list-services
```

systemd
------

����systemd�� https://wiki.archlinux.org/index.php/Systemd_%28%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%29

ϵͳ����λ�ã�/usr/lib/systemd/system/

�û�����λ�ã�/etc/systemd/system/

��ʵsystemd��enable�������ǰ�ϵͳ���������ӵ��û�����

### ��ӷ���

�����ĵ����� *man 5 systemd.unit* �� *man 5 systemd.service*

ֱ���� /usr/lib/systemd/system����/usr/lib/systemd/user����� <��Ԫ>.service�ļ�

```bash
systemctl enable <��Ԫ>.service
```
Ȼ��ִ������������


�ļ�����ʾ����
```
[Unit]
Description=nginx - high performance web server
Documentation=http://nginx.org/en/docs/
After=network.target remote-fs.target nss-lookup.target
 
[Service]
Type=forking
PIDFile=/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t -c /etc/nginx/nginx.conf
ExecStart=/usr/sbin/nginx -c /etc/nginx/nginx.conf
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s QUIT $MAINPID
PrivateTmp=true
 
[Install]
WantedBy=multi-user.target
```

### ��������
SysV ��������      | Systemd Ŀ��      | ע��
------------------|------------------|-------
0                 | runlevel0.target, poweroff.target | �ж�ϵͳ��halt��
1, s, single      | runlevel1.target, rescue.target | ���û�ģʽ
2, 4              | runlevel2.target, runlevel4.target, multi-user.target | �û��Զ�����������ͨ��ʶ��Ϊ����3��
3                 | runlevel3.target, multi-user.target | ���û�����ͼ�ν��档�û�����ͨ���ն˻������¼��
5                 | runlevel5.target, graphical.target | ���û���ͼ�ν��档�̳м���3�ķ��񣬲�����ͼ�ν������
6                 | runlevel6.target, reboot.target | ����
emergency         | emergency.target | ����ģʽ��Emergency shell�� 

### ��������

```bash
# systemd ��������
systemctl daemon-reload
systemctl restart <��Ԫ>

# �鿴������־
journalctl -b

# ����/�ر�/��ѯ���Զ�����
systemctl enable/disable/enable <��Ԫ>

# ���������������ء��رշ���
systemctl start/restart/reload/stop <��Ԫ>

# �о����з���Ԫ
systemctl list-units

# �ػ�
systemctl poweroff

# ����
systemctl reboot
```

> Written with [StackEdit](https://stackedit.io/).

