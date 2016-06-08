boost.context-1.61版本的设计模型变化
======

前言
------
之前写了个C++的协程框架[libcopp][1]，底层使用的是boost.context实现，然后剥离了对boost的依赖。然而这样意味着我必须时常跟进[boost.context][2]的更新。

顺带提一下这个协程库已经在我们线上服务器版本中使用了。

从最初的boost版本（我忘了从哪个版本开始了）一直到1.60版本，[boost.context][2]的变化都不大，都只是补全一些新的架构和体系结构，还有就是修复一些小细节的BUG，再就是增加了对valgrind的支持。新增的功能也只有[execution_context][3](现在叫execution_context_v1)，这个东西我的[libcopp][1]里其实包含了这个功能，并且本身做得比它要功能丰富，所以没有接入的必要。另外在1.60版本的时候尝试使用Windows里的fiber（当然默认是关闭的），在1.61版本里被移除了。这些细节都不是特别重要，主要还是1.61版本的变化。

然而这次变化就比较大了，首先所有的API都变更了，汇编代码里的参数和返回值也都发生了变化，当然语义也不一样了，另外还增加了新的API**ontop_fcontext**。这些变化使得[libcopp][1]的逻辑关系也必须有一些相应的调整，为了理清思路，这些都在后面分析。

API变化
------
先来看看原先的底层API

```cpp
namespace boost {
namespace context {

/**
 * @biref 执行环境上下文
 */
typedef void*   fcontext_t;

/**
 * @biref 跳转到目标上下文
 * @param ofc 当前的上下文会保存到ofc中
 * @param nfc 跳转到的目标上下文
 * @param vp 如果是第一次跳转，作为函数参数传入，如果是调回到jump_fcontext，这个是返回值
 * @param preserve_fpu 是否复制FPU（浮点数寄存器）数据
 * @return 如果调回时的透传参数
 */
extern "C" BOOST_CONTEXT_DECL
intptr_t BOOST_CONTEXT_CALLDECL jump_fcontext( fcontext_t * ofc, fcontext_t nfc,
                                               intptr_t vp, bool preserve_fpu = false);

/**
 * @biref 初始化执行环境上下文
 * @param sp 栈空间地址
 * @param size 栈空间的大小
 * @param fn 入口函数
 * @return 返回初始化完成后的执行环境上下文
 */
extern "C" BOOST_CONTEXT_DECL
fcontext_t BOOST_CONTEXT_CALLDECL make_fcontext( void * sp, std::size_t size, void (* fn)( intptr_t) );

}}
```
然后是现在的API

```cpp
namespace boost {
namespace context {

/**
 * @biref 执行环境上下文
 */
typedef void*   fcontext_t;

/**
 * @biref 跳转到目标上下文
 * @param ofc 当前的上下文会保存到ofc中
 * @param nfc 跳转到的目标上下文
 * @param vp 跳转到的目标上下文的附加参数。如果是第一次跳转，作为函数参数传入，如果是调回到jump_fcontext，这个是返回值
 * @param preserve_fpu 是否复制FPU（浮点数寄存器）数据
 * @return 如果调回时的透传参数
 */
extern "C" BOOST_CONTEXT_DECL
intptr_t BOOST_CONTEXT_CALLDECL jump_fcontext( fcontext_t * ofc, fcontext_t nfc,
                                               intptr_t vp, bool preserve_fpu = false);

/**
 * @biref 初始化执行环境上下文
 * @param sp 栈空间地址
 * @param size 栈空间的大小
 * @param fn 入口函数
 * @return 返回初始化完成后的执行环境上下文
 */
extern "C" BOOST_CONTEXT_DECL
fcontext_t BOOST_CONTEXT_CALLDECL make_fcontext( void * sp, std::size_t size, void (* fn)( intptr_t) );

}}

namespace boost {
namespace context {
namespace detail {

/**
 * @biref 执行环境上下文
 */
typedef void*   fcontext_t;

/**
 * @biref 事件参数包装
 */
struct transfer_t {
    fcontext_t  fctx; /** 相关的的执行环境上下文-不同的API里含义不一样 **/
    void    *   data; /** 自定义数据 **/
};

/**
 * @biref 跳转到目标上下文
 * @param to 当前的上下文会保存到ofc中
 * @param vp 跳转到的目标上下文的附加参数，会设置为transfer_t里的data成员
 * @return 跳转来源
 */
extern "C" BOOST_CONTEXT_DECL
transfer_t BOOST_CONTEXT_CALLDECL jump_fcontext( fcontext_t const to, void * vp);

/**
 * @biref 初始化执行环境上下文
 * @param sp 栈空间地址
 * @param size 栈空间的大小
 * @param fn 入口函数
 * @return 返回初始化完成后的执行环境上下文
 */
extern "C" BOOST_CONTEXT_DECL
fcontext_t BOOST_CONTEXT_CALLDECL make_fcontext( void * sp, std::size_t size, void (* fn)( transfer_t) );

/**
 * @biref 顶层跳转
 * @param to 当前的上下文会保存到ofc中
 * @param vp 跳转到的目标上下文的附加参数，会设置为transfer_t里的data成员
 * @param fn 入口函数，参数是跳转来源
 * @return 跳转来源
 */
// based on an idea of Giovanni Derreta
extern "C" BOOST_CONTEXT_DECL
transfer_t BOOST_CONTEXT_CALLDECL ontop_fcontext( fcontext_t const to, void * vp, transfer_t (* fn)( transfer_t) );

}}}

```

设计模型变化
------

### 向前兼容
新的API不再像老的一样，跳转后会自动保存原来的上下文。所以在兼容之前的使用方法的时候，就需要手动来保存一下。[boost.context][2]是使用了一个新的对象来记录调用者信息
```cpp
struct data_t {
    activation_record   *   from;
    void                *   data;
};
```
那么*jump_fcontext*和*ontop_fcontext*的*vp*参数都是data_t*，然后每次跳入后保存调用来源的上下文
```cpp
// ========== 调用jump_fcontext ==========
data_t d = { from, vp }; // vp 是外部传入的
// context switch from parent context to `this`-context
transfer_t t = jump_fcontext( fctx, & d);
data_t * dp = reinterpret_cast< data_t * >( t.data);
dp->from->fctx = t.fctx; // 保存来源上下文

// ========== 通过jump_fcontext第一次跳入 ==========
// tampoline function
// entered if the execution context
// is resumed for the first time
template< typename AR >
static void entry_func( detail::transfer_t t) noexcept {
    detail::data_t * dp = reinterpret_cast< detail::data_t * >( t.data);
    AR * ar = static_cast< AR * >( dp->data);
    BOOST_ASSERT( nullptr != ar);
    dp->from->fctx = t.fctx; // 保存来源上下文
    // start execution of toplevel context-function
    ar->run();
}

// ========== 调用ontop_fcontext ==========
std::tuple< void *, Fn > p = std::forward_as_tuple( data, fn);
data_t d = { from, & p };
// context switch from parent context to `this`-context
// execute Fn( Tpl) on top of `this`
transfer_t t = ontop_fcontext( fctx, & d, context_ontop< Fn >);
data_t * dp = reinterpret_cast< data_t * >( t.data);
dp->from->fctx = t.fctx; // 保存来源上下文

// ========== 通过ontop_fcontext跳入 ==========
template< typename Fn >
transfer_t context_ontop( transfer_t t) {
    data_t * dp = reinterpret_cast< data_t * >( t.data);
    dp->from->fctx = t.fctx; // 保存来源上下文
    auto tpl = reinterpret_cast< std::tuple< void *, Fn > * >( dp->data);
    BOOST_ASSERT( nullptr != tpl);
    auto data = std::get< 0 >( * tpl);
    typename std::decay< Fn >::type fn = std::forward< Fn >( std::get< 1 >( * tpl) );
    dp->data = apply( fn, std::tie( data) );
    return { t.fctx, dp };
}
```

### execution_context_v2

+ 更大规模地使用了C++11的特性，比如noexpect，右值，std::move等等。
+ 和v1自定义data_t不同，v2的透传类型是**std::tuple<Fn, args_tpl_t>**

```cpp

/** 参数包装 **/
typedef std::tuple< Args ... >     args_tpl_t;
/** 返回值包装 **/
typedef std::tuple< execution_context, typename std::decay< Args >::type ... >               ret_tpl_t;

/** 用于记录栈地址，入口函数和参数的对象 **/
typedef record< Ctx, StackAlloc, Fn, Params ... >  record_t;

// ========== 调用jump_fcontext - context_create函数内 ==========
// create fast-context
const fcontext_t fctx = make_fcontext( sp, size, & context_entry< record_t >);
BOOST_ASSERT( nullptr != fctx);
// placment new for control structure on context-stack
auto rec = ::new ( sp) record_t{
        sctx, salloc, std::forward< Fn >( fn), std::forward< Params >( params) ... };
// transfer control structure to context-stack
return jump_fcontext( fctx, rec).fctx;

// ========== 调用jump_fcontext - ret_tpl_t operator()( Args ... args)函数内 ==========
ret_tpl_t operator()( Args ... args) {
    BOOST_ASSERT( nullptr != fctx_);
    args_tpl_t data( std::forward< Args >( args) ... );
    detail::transfer_t t = detail::jump_fcontext( detail::exchange( fctx_, nullptr), & data);
    if ( nullptr != t.data) {
        data = std::move( * static_cast< args_tpl_t * >( t.data) );
    }
    return std::tuple_cat( std::forward_as_tuple( execution_context( t.fctx) ), std::move( data) );
}

// ========== 通过jump_fcontext第一次跳入 ==========
template< typename Rec >
void context_entry( transfer_t t_) noexcept {
    // transfer control structure to the context-stack
    Rec * rec = static_cast< Rec * >( t_.data);
    BOOST_ASSERT( nullptr != rec);
    transfer_t t = { nullptr, nullptr };
    try {
        // jump back to `context_create()`
        t = jump_fcontext( t_.fctx, nullptr);
        // start executing
        t = rec->run( t);
    } catch ( forced_unwind const& e) {
        t = { e.fctx, nullptr };
    }
    BOOST_ASSERT( nullptr != t.fctx);
    // destroy context-stack of `this`context on next context
    ontop_fcontext( t.fctx, rec, context_exit< Rec >);
    BOOST_ASSERT_MSG( false, "context already terminated");
}

// ========== 调用ontop_fcontext ==========
template< typename Fn >
ret_tpl_t operator()( exec_ontop_arg_t, Fn && fn, Args ... args) {
    BOOST_ASSERT( nullptr != fctx_);
    args_tpl_t data{ std::forward< Args >( args) ... };
    auto p = std::make_tuple( fn, std::move( data) );       // 透传类型是 std::tuple<Fn, args_tpl_t>
    detail::transfer_t t = detail::ontop_fcontext(
            detail::exchange( fctx_, nullptr),              // 跳入fctx_并把fctx_置空
            & p,
            detail::context_ontop< execution_context, Fn, Args ... >);
    if ( nullptr != t.data) {
        data = std::move( * static_cast< args_tpl_t * >( t.data) );
    }
    return std::tuple_cat( std::forward_as_tuple( execution_context( t.fctx) ), std::move( data) );
}

// ========== 通过ontop_fcontext跳入 ==========
template< typename Ctx, typename Fn, typename ... Args >
transfer_t context_ontop( transfer_t t) {
    auto tpl = static_cast< std::tuple< Fn, std::tuple< Args ... > > * >( t.data);
    BOOST_ASSERT( nullptr != tpl);
    typename std::decay< Fn >::type fn = std::forward< Fn >( std::get< 0 >( * tpl) );
    auto args = std::move( std::get< 1 >( * tpl) );
    Ctx ctx{ t.fctx };
    // execute function
    auto result = apply(                                // apply的作用是展开并调用fn函数： fn(ctx, unpack(args))
            fn,
            std::tuple_cat(
                std::forward_as_tuple( std::move( ctx) ),
                std::move( args) ) );
    ctx = std::move( std::get< 0 >( result) );
    // apply returned data
    detail::tail( args) = std::move( result);
    std::get< 1 >( * tpl) = std::move( args);
    return { exchange( ctx.fctx_, nullptr), & std::get< 1 >( * tpl) };
}
```

存在的问题
------
我是不建议使用[boost.context][2]的execution_context的。因为首先[libcopp][1]本身处理了它完成的功能，虽然它用模板写得，但是本身有一些兼容性问题。

比如TLS的问题，因为默认的Android和IOS标准库不支持TLS，而它里面大量使用*thread_local*关键字。首先不说非C++11的模式下没有这个关键字，即便有，在Android和IOS的默认标准库下也会link error。
对于execution_context用TLS解决的问题，在[libcopp][1]里也同时存在，并且我也没想到什么好办法去解决（用pthread_create_key并不是特别理想），所以我现在的做法是，至少Android和IOS下单线程可用，多线程不支持**copp::this_XXX**功能。

其他不是很重要的变化
------
这次的版本更新，[boost.context][2]也有一些非关键性的变更。之所以说非关键是因为这些东西可有可没有，即便没有的话自己实现也不困难。列举如下:

1. pooled_fixedsize_stack，现在[boost.context][2]自己提供了一个用于分配栈空间的内存池。内部使用了侵入式智能指针，反正[libcopp][1]本身能够很容易实现这个，并且benchmark里本身就有使用预定内存池的例子，所以我认为这是非关键的功能。
2. 很多函数重新整理了一下，增加了noexpect/nothrow等。

[1]: https://github.com/owt5008137/libcopp
[2]: http://www.boost.org/doc/libs/1_61_0/libs/context/doc/html/index.html
[3]: http://www.boost.org/doc/libs/1_61_0/libs/context/doc/html/context/ecv1.html
[4]: http://www.boost.org/doc/libs/1_61_0/libs/context/doc/html/context/ecv2.html
