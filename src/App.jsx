import { useEffect, useRef, useState } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify'
import { Modal,Offcanvas}  from 'bootstrap'
import axios from 'axios'
import './App.css'
import Header from './component/Header'
import ProductList from './component/ProductList'
import ProductCard from './component/ProductCard'
import ProductModalDetail from './ProductModalDetail'
import Pagination from './component/Pagination'
import ReactLoading from 'react-loading'

const BASE_URL = import.meta.env.VITE_BASE_URL
const PATH = import.meta.env.VITE_API_PATH


function App() {
  const [productsList,setProductsList]=useState([]) // 產品列表
  const [pagination,setPagination] = useState({}) // 產品列表分頁資訊
  const [isList, setIsList] = useState(true) // 判斷產品List/Card
  const [cart,setCart] = useState({}) // 購物車
  const [productDetail,setProductDetail] = useState({})
  const [cartQty,setCartQty] = useState(1) // 加入購物車 單獨商品
  const [cartItemsQty,setCartItemsQty] = useState([{
    id:'',
    qty:1
  }]) // 加入購物車 多獨商品

  const [formCart,setFormCart] = useState(true) // 是否購物車表單
  const [toPay,setToPay] = useState(true) // 是否「去買單」
  const [isLoading,setIsLoading] = useState(false)

  const offcanvasCartRef = useRef(null) // 購物車 Offcanvas DOM
  const addOffcanvasCartRef = useRef(null) // 購物車 new Offcanvas 的方法
  const productDetailRef = useRef(null) // 商品詳情 Modal DOM
  const addProductDetailRef = useRef(null) // 商品詳情 new Modal 的方法
  const productCategory = ['所有商品','經典眼鏡','太陽眼鏡','細框眼鏡','兒童眼鏡','配件']


  
  // 取的產品列表
  async function getProductsList(page = 1,category=null) {
    setIsLoading(true)
    try {
      const res = await axios.get(
        category 
        ? `${BASE_URL}/v2/api/${PATH}/products?page=${page}&category=${category}` 
        : `${BASE_URL}/v2/api/${PATH}/products?page=${page}`
      )
      setProductsList(res.data.products)
      setPagination(res.data.pagination)
      
      // flatMap()：對每個元素進行拆分並展平結果
      // new Set：不重複的值，再[...]攤平
      // const currentCategory = [...new Set(res.data.products.flatMap((product)=> product.category.split(',')))]
      // setProductCategory(['所有商品',...currentCategory])
      
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      setIsLoading(false)
    }
  }



  // 加入購物車
  async function addCartItem(product_id,qty) {
    setIsLoading(true)
    try {
      await axios.post(`${BASE_URL}/v2/api/${PATH}/cart`, {
        data:{
          product_id,
          qty
        }
      })
      getCart()
      showSuccessToast('成功加入購物車')
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 編輯購物車 單獨產品數量
  async function editCartItem(cart_id,product_id,qty) {
    setIsLoading(true)
    try {
      await axios.put(`${BASE_URL}/v2/api/${PATH}/cart/${cart_id}`,{data:{
        product_id,
        qty
      }})
      
      getCart()
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
      setIsLoading(false)

    }
  }


  // 編輯購物車 單獨產品數量
  async function deleteCartItem(cart_id) {
    setIsLoading(true)

    try {
      await axios.delete(`${BASE_URL}/v2/api/${PATH}/cart/${cart_id}`)
      showSuccessToast('刪除產品成功')
      getCart()
      
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
    setIsLoading(false)
    }
  }

  useEffect(()=>{
    getProductsList()
    getCart()
  },[])

  // 取得購物車列表
  async function getCart() {
    setIsLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/v2/api/${PATH}/cart`)
      setCart(res.data.data)
      const _cart = res.data.data.carts.map((item)=>{
        if(item.qty > item.product.stockQty){
          showDangerToast(`商品${item.product.title}庫存不足，最多只能購買${item.product.stockQty}個`)
          item.qty = item.product.stockQty
          editCartItem(item.id,item.product_id,item.product.stockQty)
        }
        return item
      })

      setCartItemsQty(
        _cart.map(cart=>({
          id: cart.product_id,
          qty:cart.qty
        }))
      )
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 刪除購物車（全部）
  async function deleteCartAll() {
    setIsLoading(true)
    try {
      await axios.delete(`${BASE_URL}/v2/api/${PATH}/carts`)
      getCart()
      showSuccessToast('成功清除購物車！')
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 監聽打開購物車
  function handleClickCartOffcanvas(){
    setToPay(false)
    addOffcanvasCartRef.current = new Offcanvas(offcanvasCartRef.current)
    addOffcanvasCartRef.current.show()
  }

  // 監聽關閉購物車
  function handleCloseCartOffcanvas(){
    addOffcanvasCartRef.current.hide()
  }

  // 監聽清空購物車
    function handleDeleteCartAll(){
      deleteCartAll()
    }

  // 監聽打開 產品細節
  function handleClickProductModal(product){
    const imgsIsFalsy = product.imagesUrl.every(img=> img === "")
    const imgsUrl =  [product.imageUrl,...(!imgsIsFalsy ? product.imagesUrl : [])]
    setProductDetail( {
      category:product.category || "",
      content:product.content || "",
      description:product.description || "",
      id:product.id || "",
      imageUrl:product.imageUrl || "",
      imagesUrl:imgsUrl || [],
      is_enabled:product.is_enabled ||0,
      num: product.num || 0,
      origin_price: product.origin_price || 0,
      price: product.price || 0,
      title: product.title || "",
      unit: product.unit || "",
      stockQty: product.stockQty || 0,
  })
    addProductDetailRef.current = new Modal(productDetailRef.current)
    addProductDetailRef.current.show()
  }

  // 購物車 的 商品們數量
  function getCartItemsQty(product){
    const currentItem = cartItemsQty.find(it=>it.id === product.product_id)
    
    return currentItem ? currentItem.qty : 1
  }

  // 減少商品數量 btn 
  function handleReduceCartQty(cart,formCart){
    if(formCart){
      const _itemQty =  cartItemsQty.filter((item)=> item.id === cart.product_id)
      if((_itemQty[0].qty - 1) <= 0){
        showDangerToast('最低數量是1喔！')
      }else{
        editCartItem(cart.id, cart.product_id ,_itemQty[0].qty-1)
      }

    }else{
      setCartQty(Number(cartQty > 2 ? cartQty - 1 : 1))
      if((cartQty-1) <= 0 ){
        showDangerToast('最低數量是1喔！')
      }
    }
  }

  // 增加商品數量 btn 
  function handleAddCartQty(cart,formCart,productDetail){
    if(formCart){
      const _itemQty =  cartItemsQty.filter((item)=> item.id === cart.product_id)
      if((_itemQty[0].qty + 1) > cart.product.stockQty ){
        showDangerToast(`庫存只剩${cart.product.stockQty}喔！`)
      }else{
        editCartItem(cart.id, cart.product_id ,_itemQty[0].qty+1)
      }
    }else{
      setCartQty(Number(cartQty < productDetail.stockQty ? cartQty + 1 : productDetail.stockQty))
      if((cartQty+1) > productDetail.stockQty ){
        showDangerToast(`庫存只剩${productDetail.stockQty}喔！`)
      }
    }
  }

  // 監聽 產品詳情中數量
  
  // function handleCartQtyInputOnBlur(e,cart,formCart,productDetail) {
  //   const val = Number(e.target.value)

  //   if(formCart){
  //     if(isNaN(val)){
  //       showDangerToast(`只能輸入數字喔！`)
  //       getCart()
  //     }else if(val > cart.product.stockQty){
  //       showDangerToast(`庫存只剩${cart.product.stockQty}喔！`)
  //       getCart()
  //     }else if(val < 1) {
  //       showDangerToast('最低數量是1喔！')
  //       getCart()
  //     }else{
  //       editCartItem(cart.id,cart.product_id,val)
  //     }
  //   }else{
  //     if(isNaN(val)){
  //       showDangerToast(`只能輸入數字喔！`)
  //       setCartQty(1)
  //     }else if(val > productDetail.stockQty){
  //       showDangerToast(`庫存只剩${productDetail.stockQty}喔！`)
  //       setCartQty(productDetail.stockQty)
  //     }else if(val < 1) {
  //       setCartQty(1)
  //       showDangerToast('最低數量是1喔！')
  //     }
  //   }   
  // }

  function handleCartQtyInputOnBlur(e,cart,formCart,productDetail) {
    const val = Number(e.target.value)
    if(isNaN(val) || val <1 ){
      showDangerToast('只能輸入大於0的數字喔！')
      formCart ? getCart() : setCartQty(1)
      return
    }

    const maxQty = formCart ? cart.product.stockQty : productDetail.stockQty

    if(val > maxQty){
      showDangerToast(`庫存只剩${maxQty}`)
      formCart ? getCart() : setCartQty(productDetail.stockQty)
      return
    }

    if (formCart){
      editCartItem(cart.id,cart.product_id,val)
    } else {
      setCartQty(val)
    }
  }


  // 監聽輸入數量
  function handleCartQtyInputOnChange(e,cart,formCart){
    const val = e.target.value

    if(formCart){
      setCartItemsQty ((pre)=>
        pre.map((item) => item.id === cart.product_id ? {...item, qty: val} : item)
      )
    }else{
      setCartQty(val)
    }
  }

  // 監聽 產品詳情中 加入購物車
  function handleAddCartItem(product_id,isDetail) {
    const _currentCart = cartItemsQty.filter(item => item.id === product_id)  
    if(_currentCart.length === 0) {
      addCartItem(product_id,Number(cartQty))
    } else {
      const _currentCartQty = _currentCart ? _currentCart[0].qty : 0
      const _maxQty = productDetail.stockQty

      let _purchaseQty = isDetail ? Number(cartQty) : 1
      const totalQty = _currentCartQty + _purchaseQty

      if(totalQty > _maxQty){
        _purchaseQty = _maxQty - _currentCartQty
        showDangerToast(`商品${productDetail.title}庫存不足，最多只能購買${_maxQty}個`)
      }

      if(_purchaseQty > 0){
        addCartItem(product_id,_purchaseQty)
      }
    }

    if(isDetail){
      addProductDetailRef.current.hide()
    }
    setCartQty(1)
  }

  // 監聽商品換頁
  function handlePageClick(e,page){
    e.preventDefault()
    getProductsList(page)
  }

  // 監聽商品分類
  function handleCategoryClick(e,category){
    e.preventDefault()
    if(category === '所有商品'){
    getProductsList(1)
    }else{
      getProductsList(1,category)
    }
  }

  // 成功訊息
  const showSuccessToast = (text) => {
    toast.success(text, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    })
  }

  // 錯誤訊息
  const showErrorToast = (text) => {
    toast.error(text, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
      });
  }

  // 警示訊息
  const showDangerToast = (text) => {
    toast.warn(text, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
      });
  }



  return (
    <>
      <Header
        handleClickCartOffcanvas={handleClickCartOffcanvas}
        offcanvasCartRef={offcanvasCartRef}
        handleCloseCartOffcanvas={handleCloseCartOffcanvas}
        cart={cart}
        toPay={toPay}
        getCartItemsQty={getCartItemsQty}
        deleteCartItem={deleteCartItem}
        handleReduceCartQty={handleReduceCartQty}
        handleCartQtyInputOnChange={handleCartQtyInputOnChange}
        handleCartQtyInputOnBlur={handleCartQtyInputOnBlur}
        handleAddCartQty={handleAddCartQty}
        setToPay={setToPay}
        handleDeleteCartAll={handleDeleteCartAll}
        formCart={formCart}
        showErrorToast={showErrorToast}
        showSuccessToast={showSuccessToast}
        getCart={getCart}
        addOffcanvasCartRef={addOffcanvasCartRef}
        BASE_URL={BASE_URL}
        PATH={PATH}
        axios={axios}
      ></Header>

      <main className="container mt-3">
        <div className="row">
          <div className="col-12 d-flex justify-content-end">
            <div className="btn-group">
              <button 
                type="button" 
                className={`btn btn-outline-primary select-list-type ps-4 pe-4 ${isList ? "active" : ""}`}
                onClick={()=> setIsList(true)}
                >
                <i className="bi bi-justify"></i>
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary select-list-type ps-4 pe-4 ${!isList ? "active" : ""}`}
                onClick={()=> setIsList(false)}>
                <i className="bi bi-grid"></i>
              </button>
            </div>
          </div>

          <aside className="col-2 mt-5">
            <ul className="list-group">
              {
                productCategory.map((category)=>(
                  <li className="list-group-item  aside-list"  key={category}>
                    <a 
                      onClick={(e)=>handleCategoryClick(e,category)}
                      href="#"
                      className="text-decoration-none text-dark">
                      {category}
                    </a>
                  </li>
                ))
              }
            </ul>
          </aside>

          <section className="col-10">
            {
              isList 
              ?
              <ProductList
                productsList={productsList}
                handleClickProductModal={handleClickProductModal}
                handleAddCartItem={handleAddCartItem}
              />
              :
              <ProductCard
                productsList={productsList}
                handleClickProductModal={handleClickProductModal}
                handleAddCartItem={handleAddCartItem}
              />
            }
            <ProductModalDetail
              productDetailRef={productDetailRef}
              productDetail={productDetail}
              setProductDetail={setProductDetail}
              handleReduceCartQty={handleReduceCartQty}
              cartQty={cartQty}
              handleCartQtyInputOnChange={handleCartQtyInputOnChange}
              handleCartQtyInputOnBlur={handleCartQtyInputOnBlur}
              handleAddCartQty={handleAddCartQty}
              handleAddCartItem={handleAddCartItem}
            />
            <Pagination
              pagination={pagination}
              handlePageClick={handlePageClick}
            />
          </section>
      </div>
    </main>

    <ToastContainer />

    {
      isLoading &&
      <div className="loading-contain d-flex justify-content-center align-items-center">
        <ReactLoading type={'cylon'} color={'#0d6efd'} height={120} width={100} />
      </div>
    }
  </>)
}

export default App
