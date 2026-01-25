package ec.edu.espe.msinventario.repositories;

import ec.edu.espe.msinventario.models.entities.Inventario;
import ec.edu.espe.msinventario.models.entities.Sucursal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    // Para validar si ya existe el producto en esa sucursal
    Optional<Inventario> findBySucursalAndMedicamentoId(Sucursal sucursal, Long medicamentoId);

    // Para obtener todos los inventarios de una sucursal
    List<Inventario> findBySucursal(Sucursal sucursal);
}
