package ec.edu.espe.msventas.services;

import ec.edu.espe.msventas.models.entities.Venta;
import java.util.List;
import java.util.Optional;

public interface VentaService {
    Venta crearVenta(Venta venta);
    List<Venta> listarVentas();
    Optional<Venta> buscarPorId(Long id);
}
