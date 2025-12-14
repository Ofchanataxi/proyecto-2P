package ec.edu.espe.msventas.services;

import ec.edu.espe.msventas.clients.CatalogoClient;
import ec.edu.espe.msventas.clients.InventarioClient;
import ec.edu.espe.msventas.models.dto.InventarioDTO;
import ec.edu.espe.msventas.models.dto.ProductoDTO;
import ec.edu.espe.msventas.models.entities.DetalleVenta;
import ec.edu.espe.msventas.models.entities.Venta;
import ec.edu.espe.msventas.repositories.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class VentaServiceImpl implements VentaService {

    @Autowired
    private VentaRepository repository;
    @Autowired
    private CatalogoClient catalogoClient;
    @Autowired
    private InventarioClient inventarioClient;

    @Override
    @Transactional
    public Venta crearVenta(Venta venta) {
        double totalVenta = 0;

        for (DetalleVenta detalle : venta.getDetalles()) {
            // A. Validar producto (igual que antes) ...
            ProductoDTO producto = catalogoClient.obtenerProducto(detalle.getMedicamentoId());
            if (producto == null) throw new RuntimeException("Producto no existe: " + detalle.getMedicamentoId());

            detalle.setPrecioUnitario(producto.getPrecioUnitario());
            detalle.setSubtotal(producto.getPrecioUnitario() * detalle.getCantidad());
            totalVenta += detalle.getSubtotal();

            // B. Validar stock (igual que antes) ...
            InventarioDTO inventario = inventarioClient.verificarStock(venta.getSucursalId(), detalle.getMedicamentoId());
            if (inventario == null || inventario.getCantidad() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            // C. Descontar stock (AHORA USAMOS EL NUEVO DTO PLANO Y CANTIDAD POSITIVA)
            Map<String, Object> stockRequest = new HashMap<>();
            stockRequest.put("sucursalId", venta.getSucursalId());
            stockRequest.put("medicamentoId", detalle.getMedicamentoId());
            stockRequest.put("cantidad", detalle.getCantidad()); // ¡Positivo!

            inventarioClient.descontarStock(stockRequest);
        }

        venta.setTotal(totalVenta);
        return repository.save(venta);
    }
}