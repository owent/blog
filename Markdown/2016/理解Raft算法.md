理解Raft算法
======

<!-- toc -->

前言
------
最近在分布式系统一致性方面，[Raft](https://raft.github.io/)算法比较火啊。所以就抽时间看了下这个算法。

之前已经有[Paxos算法](https://zh.wikipedia.org/zh-cn/Paxos%E7%AE%97%E6%B3%95)，用于解决分布式系统最终一致性问题，而且已经有了[zookeeper](http://http://zookeeper.apache.org/)这个成熟的开源实现。那么这个[Raft](https://raft.github.io/)算法有啥用呢？按照[Raft](https://raft.github.io/)官网的说法，这个算法的错误容忍和性能和[Paxos算法](https://zh.wikipedia.org/zh-cn/Paxos%E7%AE%97%E6%B3%95)类似，但是拥有更加简单易懂的设计。

看过[Paxos算法](https://zh.wikipedia.org/zh-cn/Paxos%E7%AE%97%E6%B3%95)的童鞋们都知道，这货复杂地和屎一样，为了实现去中心化而考虑了各种复杂的边界条件和时序下的可靠性。而[Raft](https://raft.github.io/)算法则根据实际应用中的需要，简化了设计模型，不采用去中心化设计，而是自动选举中心节点，并且在各种情况和时序下可以保证能够正确的选举出中心节点并保证数据的一致性。而且也正是由于能够选举出唯一的主节点（Leader）使得整个通信流程非常地简单，并且易于理解和维护。

那么它是如何做到这些的呢？

基本算法设计
------
[Raft](https://raft.github.io/)的基本设计可以参照官网介绍 https://raft.github.io/

官方网站上的图例可以点击节点，然后**模拟**节点crash或者超时或者收到请求时的通信流程。其实也是一个javascript的简单实现，有利于我们理解[Raft](https://raft.github.io/)算法的流程。

另外还有一个基本要点的流程有点像PPT的东东也能帮助我们理解 http://thesecretlivesofdata.com/raft/

当然最完整的就是这篇Paper了，[《In Search of an Understandable Consensus Algorithm (Extended Version)》](http://ramcloud.stanford.edu/raft.pdf)


基本思路是每个节点分为Leader、Follower、Candidate三个状态。

+ Leader: 主节点
+ Follower: 从节点
+ Candidate: 正在竞选主节点

节点中要记录

+ Term: 选举版本号
+ Commit Index: 提交序号

消息分为:

1. Uncommit: 未提交转态（Client发到主节点，主节点还没有得到大多数从节点的提交回执）
2. Commited: 已提交转态（从节点收到主节点的消息提交，还未收到确认报文）
3. Applied: 已确认转态（从节点收到主节点的确认报文，或主节点已收到大多数从节点的提交回执）

流程图前面的Paper和文献里都写得比较清楚了我就不复述了，只提出我认为比较重要的点。

1. 最重要的核心是用定时器和心跳包来同步数据和更新状态
2. 从节点收到**选举**请求或**心跳**请求时重置定时器
3. 主节点只追加数据，不改写
4. 初始所有节点都是Follower，**随机**取一个比较小的时间间隔（150ms~300ms）
> 这样初始状态下很快就会进入竞选节点状态

5. 短期定时器: 主节点以比较小的时间间隔发心跳包，并附带Term版本号和log版本号
6. 长期定时器: 从节点以比较大的**随机时间间隔**触发主节点丢失并竞选主节点的行为，如果时间间隔内收到任何包，重置这个定时器
7. 除了主节点的心跳使用**短期定时器**，其他的情况一律只是用**长期定时器**
8. 收到竞选消息时，如果投同意票，则转为从节点并需要重置**长期定时器**
9. 竞选主节点时，必须**Term和Commit Index都大于等于从节点**，才会获得该从节点的投票
> 这样即便孤岛上出现了新的主节点（这种情况一定是新的拥有大多数节点的孤岛不包含原先的主节点），在重新连通后，也能在某一次新的同步下最终统一到新的主节点。而在全部同步到新主节点之前，老的主节点收到的Client的消息因为得不到大多数从节点的确认而不会生效。

10. 竞选主节点时，Term+1，转入Candidate状态，并**随机**长期定时器。需要得到大多数投票才能转为主节点
> 如果失败了，可能是没能达成一致，也可能是超时，这时候通过随机时间间隔可以把正在协商的Candidate节点的下次发起竞选主节点的时间错开。
> 
> 同时如果Candidate收到Term更大的消息，将会转为从节点
> 
> 如果未竞选成功，则依靠随机来解决定时器和消息延迟带来的冲突（协商不一致）问题

11. 新的主节点可以确认之前未处理完的*已提交转态*但未确认的消息，并向从节点发确认报文
> 这时候有些从节点可能已经收到了这些消息的确认报文，所以这时候可以覆盖确认状态，也不会有什么问题。而没有确认的从节点将会收到确认请求。但是这时候有一个问题，就是客户端可能没有收到回执，这种情况后面会再说明。

未提及的细节
------
从节点Commit Index较高但收到竞选请求,Commit Index较低的节点先触发超时并转为Candidate状态。这时候有两种情况：

1. Commit已被确认：这时候必然会有一个已经收到这个消息的从节点发出的竞选协议被大多数从节点同意，没有收到这个消息的从节点的竞选不会被大多数从节点同意
2. Commit未被确认：这种情况就是消息没发送成功，Client也不会收到回执

定时器随机的时间应该远大于估计的通信延迟（避免频繁冲突）

主节点丢失期间，客户端commit的消息会得不到回复

commit index（用于消息序号）和term（用于leader选举）
apply消息未达前leader崩溃，before or after client收到confirm消息
client票据+commit index
client重发机制

http://stackoverflow.com/questions/34672331/what-will-happen-to-replicated-but-uncommited-logs-in-raft-protocol

与Paxos的差异
------
性能方面的分析

适用范围
------
redis cluster自动负载均衡
管理者<->leader


Raft服务节点的扩容和缩容
------