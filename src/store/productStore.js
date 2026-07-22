import { create } from "zustand";
import API from "../services/api";

const useProductStore = create((set, get) => ({
  // ===========================
  // STATES
  // ===========================

  products: [], // seller dashboard products

  storefront: [], // public storefront products

  categories: [], // category names

  fullMenu: [], // complete categorized menu

  combos: [], // combo meals

  festiveDeals: [], // active festive offers

  mohallas: [], // delivery locations

  loading: false,

  error: null,


  // ===========================
  // ADD PRODUCT
  // ===========================

  addProduct: async (formData) => {
    try {
      set({ loading: true, error: null });

      const res = await API.post("/product/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const raw =
        res.data.product ||
        res.data.data ||
        res.data;

      set({
        products: [
          {
            ...raw,
            available:
              raw.is_available ??
              raw.available,
          },
          ...get().products,
        ],
      });

      return res.data;

    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          "Unable to add product",
      });

      throw err;

    } finally {
      set({
        loading:false,
      });
    }
  },


  // ===========================
  // UPDATE PRODUCT
  // ===========================

  updateProduct: async (id, formData) => {
    try {

      set({
        loading:true,
        error:null,
      });


      const res = await API.put(
        `/product/update/${id}`,
        formData,
        {
          headers:{
            "Content-Type":
            "multipart/form-data",
          },
        }
      );


      const raw =
        res.data.product ||
        res.data.data ||
        res.data;


      const updated = {
        ...raw,
        available:
          raw.is_available ??
          raw.available,
      };


      set({

        products:
          get().products.map((p)=>
            p._id === id
              ? {
                  ...p,
                  ...updated,
                }
              : p
          ),

      });


      return res.data;


    } catch(err){

      set({
        error:
        err.response?.data?.message ||
        "Unable to update product",
      });

      throw err;

    } finally {

      set({
        loading:false,
      });

    }
  },



  // ===========================
  // DELETE PRODUCT
  // ===========================

  deleteProduct: async(id)=>{

    try{

      set({
        loading:true,
        error:null,
      });


      const res =
        await API.delete(
          `/product/delete/${id}`
        );


      set({

        products:
        get().products.filter(
          (p)=>p._id!==id
        ),

      });


      return res.data;


    }catch(err){

      set({
        error:
        err.response?.data?.message ||
        "Unable to delete product",
      });

      throw err;

    }finally{

      set({
        loading:false,
      });

    }

  },



  // ===========================
  // DASHBOARD PRODUCTS
  // ===========================

  fetchDashboardProducts: async()=>{

    try{

      set({
        loading:true,
        error:null,
      });


      const res =
        await API.get(
          "/product/dashboard/all"
        );


      const list =
        res.data.products ||
        res.data.data ||
        res.data;


      set({

        products:
        list.map((p)=>({
          ...p,
          available:
          p.is_available ??
          p.available,
        })),

      });


      return list;


    }catch(err){

      set({
        error:
        err.response?.data?.message ||
        "Unable to load products",
      });

      throw err;

    }finally{

      set({
        loading:false,
      });

    }

  },



  // ===========================
  // STOREFRONT PRODUCTS
  // ===========================

  fetchStorefrontCatalog:
  async(
    sellerId,
    {
      category,
      search,
    }={}
  )=>{

    try{

      set({
        loading:true,
        error:null,
      });


      const params={};


      if(category)
        params.category=category;


      if(search)
        params.search=search;



      const res =
        await API.get(
          `/product/${sellerId}/products`,
          {
            params,
          }
        );


      const list =
        res.data.products ||
        res.data.data ||
        res.data;



      set({
        storefront:list,
      });


      return list;


    }catch(err){

      set({
        error:
        err.response?.data?.message ||
        "Unable to load catalog",
      });

      throw err;


    }finally{

      set({
        loading:false,
      });

    }

  },



  // ===========================
  // CATEGORIES
  // ===========================

  fetchStorefrontCategories:
  async(sellerId)=>{

    try{

      set({
        loading:true,
        error:null,
      });


      const res =
      await API.get(
        `/product/${sellerId}/categories`
      );


      const list =
        res.data.categories ||
        [];


      set({
        categories:list,
      });


      return list;


    }catch(err){

      set({
        error:
        err.response?.data?.message ||
        "Unable to load categories",
      });


      throw err;


    }finally{

      set({
        loading:false,
      });

    }

  },



  // ===========================
  // FULL MENU
  // ===========================

  fetchFullMenu:
  async(sellerId)=>{

    try{

      set({
        loading:true,
        error:null,
      });


      const res =
      await API.get(
        `/menu-categories/full/${sellerId}`
      );


      const menu =
        res.data.menu || [];


      set({
        fullMenu:menu,
      });


      return menu;


    }catch(err){

      set({
        error:
        err.response?.data?.message ||
        "Unable to load full menu",
      });


      throw err;


    }finally{

      set({
        loading:false,
      });

    }

  },



  // ===========================
  // COMBOS
  // ===========================

  fetchCombos:
  async(sellerId)=>{

    try{

      const res =
      await API.get(
        `/combos/storefront/${sellerId}`
      );


      const combos =
        res.data.combos || [];


      set({
        combos,
      });


      return combos;


    }catch(err){

      set({
        error:
        err.response?.data?.message ||
        "Unable to load combos",
      });


      throw err;

    }

  },



  // ===========================
  // FESTIVE DEALS
  // ===========================

  fetchFestiveDeals:
  async(sellerId)=>{

    try{


      const res =
      await API.get(
        `/festive-deals/storefront/${sellerId}`
      );


      const deals =
        res.data.deals ||
        res.data.data ||
        [];


      set({
        festiveDeals:deals,
      });


      return deals;


    }catch(err){

      set({
        error:
        err.response?.data?.message ||
        "Unable to load festive deals",
      });


      throw err;

    }

  },



  // ===========================
  // DELIVERY LOCATIONS
  // ===========================

  fetchAvailableMohallas:
  async(sellerId)=>{

    try{


      const res =
      await API.get(
        `/customer/mohallas/${sellerId}`
      );


      const list =
        res.data.mohendra_locations ||
        [];


      set({
        mohallas:list,
      });


      return list;


    }catch(err){

      set({
        error:
        err.response?.data?.message ||
        "Unable to load locations",
      });


      throw err;

    }

  },



  // ===========================
  // RESET
  // ===========================

  reset:()=>{

    set({

      products:[],
      storefront:[],
      categories:[],
      fullMenu:[],
      combos:[],
      festiveDeals:[],
      mohallas:[],

      loading:false,
      error:null,

    });

  },


}));


export default useProductStore;