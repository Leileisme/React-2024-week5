import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as bootstrap from "bootstrap"
import axios from 'axios'
import './App.css'

const BASE_URL = import.meta.env.VITE_BASE_URL
const PATH = import.meta.env.VITE_API_PATH


function App() {
  const [productsList,setProductsList]=useState([]) // 產品列表
  // const [productCategory,setProductCategory]=useState([]) // 產品分類
  const [pagination,setPagination] = useState({}) // 產品列表分頁資訊
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
      
      // flatMap()：對每個元素進行拆分並展平結果
      // new Set：不重複的值，再[...]攤平
      // const currentCategory = [...new Set(res.data.products.flatMap((product)=> product.category.split(',')))]
      // setProductCategory(['所有商品',...currentCategory])
      
    } catch (error) {
      console.log('載入商品分類錯誤',error);
    }
  }

  useEffect(()=>{
    getProductsList()
  },[])


  function handlePageClick(e,page){
    e.preventDefault()
    getProductsList(page)
  }

  function handleCategoryClick(e,category){
    e.preventDefault()
    if(category === '所有商品'){
    getProductsList(1)
    }else{
      getProductsList(1,category)
    }
  }


  return (
    <>

      <header className="fixed-top bg-white container p-3">
        <div className="row">
          <div className="col-3">
            <h1 className="h3">眼鏡店</h1>
          </div>
          <div className="col-9 d-flex justify-content-end align-items-center">
            <button type="button" className="btn btn-outline-primary">
              <i className="bi bi-bag me-2"></i>
              <span>購物車</span>
            </button>
          </div>
        </div>
      </header>

        <main className="container mt-3">
          <div className="row">
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
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">圖片</th>
                    <th scope="col">商品名稱</th>
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
                          <button type="button" className="btn btn-sm btn-outline-secondary">
                            查看詳情</button>
                          <button type="button" className="btn btn-sm btn-primary">加入購物車</button>
                        </div>
                      </td>
                    </tr>
                  ))
                  }
                </tbody>
              </table>

              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-center">
                  <li className="page-item">
                    <a
                      className={`page-link ${pagination.has_pre ? "" : "disabled"}`}
                      href="#"
                      aria-label="Previous"
                      onClick={(e)=>handlePageClick(e,pagination.current_page-1)}>
                      <span aria-hidden="true">&laquo;</span>
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
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </section>
        </div>
      </main>
    </>
  )
}

export default App
