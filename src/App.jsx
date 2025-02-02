import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as bootstrap from "bootstrap"
import axios from 'axios'
import './App.css'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { Modal,Offcanvas}  from 'bootstrap'


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

  const [formCart,setFormCart] = useState(true)

  const offcanvasCartRef = useRef(null) // 購物車 Offcanvas DOM
  const addOffcanvasCartRef = useRef(null) // 購物車 new Offcanvas 的方法
  const productDetailRef = useRef(null) // 商品詳情 Modal DOM
  const addProductDetailRef = useRef(null) // 商品詳情 new Modal 的方法
  const productCategory = ['所有商品','經典眼鏡','太陽眼鏡','細框眼鏡','兒童眼鏡','配件']


  
  // 取的產品列表
  async function getProductsList(page = 1,category=null) {
    try {
      const res = await axios.get(
        category 
        ? `${BASE_URL}/v2/api/${PATH}/products?page=${page}&category=${category}` 
        : `${BASE_URL}/v2/api/${PATH}/products?page=${page}`
      )
      setProductsList(res.data.products)
      setPagination(res.data.pagination)
      console.log(res.data);
      console.log(cart.carts)
      
      // flatMap()：對每個元素進行拆分並展平結果
      // new Set：不重複的值，再[...]攤平
      // const currentCategory = [...new Set(res.data.products.flatMap((product)=> product.category.split(',')))]
      // setProductCategory(['所有商品',...currentCategory])
      
    } catch (error) {
      console.log('載入商品分類錯誤',error);
      showErrorToast(error?.response?.data?.message)
    }
  }



  // 加入購物車
  async function addCartItem(product_id,qty) {
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
      console.log('加入購物車錯誤',error);
      showErrorToast(error?.response?.data?.message)
    }
  }



  useEffect(()=>{
    getProductsList()
    getCart()
  },[])

  // 取得購物車列表
  async function getCart() {
    try {
      const res = await axios.get(`${BASE_URL}/v2/api/${PATH}/cart`)
      console.log('購物車', res.data.data)
      setCart(res.data.data)
      
      setCartItemsQty(
        res.data.data.carts.map(cart=>({
          id: cart.product_id,
          qty:cart.qty
        }))
      )
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
      
    }
  }

  // 刪除購物車（全部）
  async function deleteCartAll() {
    try {
      const res = await axios.delete(`${BASE_URL}/v2/api/${PATH}/carts`)
      getCart()
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
      
    }
  }

  // 監聽打開購物車
  function handleClickCartOffcanvas(){
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
    const imgsUrl =  [product.imageUrl,...(product.imagesUrl || [])]
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
  })
    addProductDetailRef.current = new Modal(productDetailRef.current)
    addProductDetailRef.current.show()
  }

  // 購物車 的 商品們數量
  function getCartItemsQty(product){
    console.log('cartItemsQty',cartItemsQty);
    console.log('夠故車車車車222',product);
    
    const currentItem = cartItemsQty.find(it=>it.id === product.product_id)
    
    return currentItem ? currentItem.qty : 1
  }

  // 減少商品數量 btn 
  function handleReduceCartQty(e,product,formCart){
    setCartQty(Number(cartQty > 2 ? cartQty - 1 : 1))
    if((cartQty-1) <= 0 ){
      showDangerToast('最低數量是1喔！')
    }
    if(formCart){
      addCartItem(product.id,)
    }
  }

  // 增加商品數量 btn 
  function handleAddCartQty(product,formCart){
    console.log('增加商品數量',product);
    
    setCartQty(Number(cartQty < product.stockQty ? cartQty + 1 : product.stockQty))
    if((cartQty+1) > product.stockQty ){
      showDangerToast(`庫存只剩${product.stockQty}喔！`)
    }
  }

  // 監聽 產品詳情中數量
  function handleCartQtyInput(e,product,formCart) {
    const val = Number(e.target.value)
    if(isNaN(val)){
      showDangerToast(`只能輸入數字喔！`)
      setCartQty(1)
    }else if(val > product.stockQty){
      showDangerToast(`庫存只剩${product.stockQty}喔！`)
      setCartQty(product.stockQty)
    }else if(val < 1) {
      setCartQty(1)
      showDangerToast('最低數量是1喔！')
    }
  }

  // 監聽 產品詳情中 加入購物車
  function handleAddCartItem(id,cartQty) {
    addCartItem(id,cartQty)
    addProductDetailRef.current.hide()
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
      autoClose: 3000,
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

      <header className="fixed-top bg-white container p-3">
        <div className="row">
          <div className="col-3">
            <h1 className="h3">眼鏡店</h1>
          </div>
          <div className="col-9 d-flex justify-content-end align-items-center">
            {/* <button type="button" className="btn btn-outline-primary">
              <i className="bi bi-bag me-2"></i>
              <span>購物車</span>
            </button> */}
            <button className="btn btn-outline-primary position-relative" type="button" onClick={handleClickCartOffcanvas}>
              <i className="bi bi-bag me-2"></i>
              <span>購物車</span>
                {
                  cart?.carts?.length > 0
                  ?
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    { cart?.carts?.reduce((total, item)=> total+item.qty, 0) }
                    <span className="visually-hidden">購物車數量</span>
                  </span>
                  :
                  ""
                }
            </button>

            <div className="offcanvas offcanvas-end cart-offcanvas" tabIndex="-1" ref={offcanvasCartRef}>
              <div className="offcanvas-header">
                <h5 className="offcanvas-title">購物車</h5>
                <button type="button" className="btn-close" onClick={handleCloseCartOffcanvas} ></button>
              </div>
              <div className="offcanvas-body">
              <table className="table">
                  <thead>
                    <tr>
                      <th scope="col"></th>
                      <th scope="col">商品名稱</th>
                      <th scope="col">數量/單位</th>
                      <th scope="col">庫存</th>
                      <th scope="col">價格</th>

                      <th></th>
                    </tr>
                  </thead>
                  <tbody >

                    { cart.carts
                      &&
                      cart.carts?.map((item)=>(
                        <tr key={item.product.id}>
                          <td className="align-content-center">
                            <input className="form-check-input" type="checkbox" ></input>
                          </td>
                          <td className="align-content-center " style={{width:"180px"}}>{item.product.title}</td>
                          <td className="align-content-center  ">
                            <span className="me-2 d-flex align-items-center ">
                              <button 
                                type="button"
                                className={`btn btn-sm btn-outline-primary`}
                                onClick={(e)=>handleReduceCartQty(e,item.product,formCart)}
                              >-</button>
                              <input
                                type="text"
                                className="form-control cart-number-input text-center "
                                value={getCartItemsQty(item)}
                                onChange={(e) => setCartQty(e.target.value)} 
                                onBlur={(e)=>{handleCartQtyInput(e,item.product,formCart)}}
                              />
                              <button
                                type="button"
                                className={`btn btn-sm btn-outline-primary`}
                                onClick={()=>handleAddCartQty(item.product,formCart)}
                              >+</button>
                              <span className="ms-2">{item.product.unit}</span>
                            </span>
                          </td>
                          <td className="align-content-center">
                            <span className="d-flex text-secondary">{item.product.stockQty}</span>
                          </td>
                          <td className="align-content-center" style={{width:"100px"}}>
                            <span className="text-danger" >$ {item.final_total}</span>
                          </td>
                        </tr>
                      ))
                    }
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="align-content-center">總價</td>
                      <td className="align-content-center">$ {cart?.final_total}</td>
                    </tr>
                  </tbody>
                </table>

                <button type="button" className={`btn btn-sm btn-primary w-100 mb-2 mt-5 ${cart?.carts?.length === 0 ? "disabled" : ""}`}>去買單</button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-danger w-100"
                  onClick={handleDeleteCartAll}
                  >清空購物車</button>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                  <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">圖片</th>
                      <th scope="col" >商品名稱</th>
                      <th scope="col">分類</th>
                      <th scope="col">價格</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody >
                    {productsList.map((product,index)=>(
                      <tr key={product.id} >
                        <td className="align-content-center"><img src={product.imageUrl} alt="" className="product-list-img" /></td>
                        <td className="align-content-center"> <h3 className="h6">{product.title}</h3></td>
                        <td className="align-content-center">{product.category}</td>
                        <td className="align-content-center">
                          <span className="h5 text-danger">$ {product.price}</span>
                          <br />
                          <del className="text-secondary">$ {product.origin_price}</del>
                        </td>
                        <td className="align-content-center">
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={()=>handleClickProductModal(product)}
                              >
                              查看詳情
                            </button>


                            <div ref={productDetailRef} className="modal fade "  tabIndex="-1">
                              <div className="modal-dialog ">
                                <div className="modal-content product-detail">
                                  <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="exampleModalLabel">{productDetail.title}</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                  </div>
                                  <div className="modal-body">
                                    <div className="row">
                                      <div className="col-12 d-flex justify-content-between">
                                        <div className="product-modal-secondary-img-container">
                                          {Array.isArray(productDetail.imagesUrl,index) && productDetail?.imagesUrl.map((img)=>(
                                            <div key={img} className="mb-2">
                                              <img 
                                                src={img}
                                                alt="副圖"
                                                className="product-modal-secondary-img"
                                                onClick={()=>{
                                                  setProductDetail({
                                                    ...productDetail,
                                                    imageUrl:img
                                                  })
                                                }}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                          <img src={productDetail.imageUrl} alt="主圖" className="product-modal-primary-img" />
                                        </div>
                                      </div>
                                      <div className="col-12 mt-2 d-flex align-items-center">
                                        <span className="text-secondary">價格：</span>
                                        <span className="text-danger me-2 fs-3">${productDetail.price}</span>
                                        <del className="text-secondary fs-6">${productDetail.origin_price}</del>
                                      </div>
                                      <div className="col-12 mt-2 d-flex align-items-center">
                                        <span className="text-secondary">數量：</span>
                                        <span className="text-danger me-2 d-flex align-items-center ">
                                          <button 
                                          type="button"
                                          className={`btn btn-sm btn-outline-primary`}
                                          onClick={handleReduceCartQty}
                                          >-</button>
                                          <input
                                          type="text"
                                          className="form-control cart-number-input text-center "
                                          value={cartQty}
                                          onChange={(e) => setCartQty(e.target.value)} 
                                          onBlur={(e)=>{handleCartQtyInput(e,productDetail)}}
                                          />
                                          <button
                                            type="button"
                                            className={`btn btn-sm btn-outline-primary`}
                                            onClick={()=>handleAddCartQty(productDetail)}
                                            >+</button>
                                        </span>
                                        <span className="text-secondary fs-6">剩下{productDetail.stockQty }個</span>
                                      </div>
                                      <div className="col-12 mt-3">
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-primary w-100"
                                          onClick={()=>handleAddCartItem(productDetail.id,cartQty) }>
                                          加入購物車
                                        </button>
                                      </div>
                                      <div className="col-12 mt-3">
                                        <h5 className="h6 text-p">產品描述：</h5>
                                        <p className="text-secondary">{productDetail.description}</p>

                                        <h5 className="h6">商品說明：</h5>
                                        <p className="text-secondary pre-line">{productDetail.content}</p>
                                      </div>
                                  </div>
                                  <div className="modal-footer">
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={()=>addCartItem(product.id,1) }>
                              加入購物車
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    }
                  </tbody>
                </table>
              :
                <div  className="row mt-4">
                  {
                    productsList.map((product,index)=>(
                          <div className="col-3 mb-4 " key={product.id}>
                            <div className="card product-card">
                            <img src={product.imageUrl}  className="card-img-top product-card-img position-relative"  alt="商品主圖" />

                            {/* <div className="h5">
                              <span className="position-absolute top-0 translate-middle-y badge text-bg-primary product-card-badge">
                                  {product.category} 
                                <span className="visually-hidden">商品分類</span>
                              </span>
                            </div> */}
                            <div className="card-body product-car-body d-flex flex-column justify-content-between">
                              <div>
                                <h5 className="card-title product-card-title h6">{product.title}</h5>
                              </div>

                              <div className="align-items-bottom">
                                <p className="card-text mb-2">
                                  <span className="h4 text-danger">$ {product.price}</span>
                                  <span className="text-secondary">／</span>
                                  <del className="text-secondary">$ {product.origin_price}</del>
                                </p>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary w-100"
                                  onClick={()=>addCartItem(product.id,1) }>
                                  加入購物車
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                    ))
                  }
                </div>
              }
            

              
              

              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-center">
                  <li className="page-item">
                    <a
                      className={`page-link ${pagination.has_pre ? "" : "disabled"}`}
                      href="#"
                      aria-label="Previous"
                      onClick={(e)=>handlePageClick(e,pagination.current_page-1)}>
                      <span>&laquo;</span>
                    </a>
                  </li>
                  {
                    [...new Array(pagination.total_pages)].map((_,index)=>(
                      <li className="page-item" key={index}>
                        <a
                          className={`page-link ${pagination.current_page === index+1 ? "active" : ""}`}
                          href="#" onClick={(e)=>handlePageClick(e,index+1)} >
                          {index+1}
                        </a>
                      </li>
                    ))
                  }
                  <li className="page-item">
                    <a 
                      className={`page-link ${pagination.has_next ? "" : "disabled"}`}
                      href="#"
                      aria-label="Next"
                      onClick={(e)=>handlePageClick(e,pagination.current_page+1)}>
                      <span>&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </section>
        </div>
      </main>

      <ToastContainer />
    </>
  )
}

export default App
