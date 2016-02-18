libatbus基本功能及单元测试终于写完啦
======

[libatbus](https://github.com/owt5008137/libatbus)
------

经过茫茫长时间的编写+过年在家无聊补充和修正单元测试，再加上这两天的整理，终于把以前的这个关于服务器通信中间件的基本功能和响应的单元测试完成啦。还是可以热烈庆祝一下的。

[《关于BUS通信系统的一些思考（一）》](https://www.owent.net/r4DoG)
[《关于BUS通信系统的一些思考（二）》](https://www.owent.net/gCsOx)
[《关于BUS通信系统的一些思考（三）》](https://www.owent.net/V1j6B)

在实现这个[libatbus](https://github.com/owt5008137/libatbus)的过程中，为了能够跨平台并且能有比较高的性能，并且目前只有我一个人用业余时间开发，底层使用了一些开源项目。这样我们就有了性能不输TX的**tsf4g::tbus**性能并且支持动态通道+更加节省内存的全异步树形结构通信中间件。接下来就要准备开始折腾服务器app框架啦。并且在使用到的地方对这个[libatbus](https://github.com/owt5008137/libatbus)还会有后续的扩充。

写单元测试确实花了不少时间，

目前状态
------
Github仓库地址： https://github.com/owt5008137/libatbus
CentOS 7.1 + GCC 4.8.4 无warning，单元测试全部pass
MSVC 14 两处类型转换warning（无影响），单元测试除unix socket外全部pass

valgrind: 无内存泄露
cppcheck: libatbus无error报告，其他类型的报告都是误报或功能预留。单元测试和压力测试工具有3处error报告，全部都是误报。

早期的压力测试，大约每个端点（单线程）内存通道大约1.2GB/s，socket大约200MB/s。近期尚未压力测试。


后续计划
------
CI集成
全量表
广播

服务器应用框架
------
proxy-zookeeper